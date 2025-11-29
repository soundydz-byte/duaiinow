"use server"

import { createClient } from "@/lib/supabase/server"

// Function to fetch driving distance from OSRM
async function fetchDrivingDistance(start: [number, number], end: [number, number]): Promise<number | null> {
  try {
    // OSRM expects: longitude,latitude
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=false`
    )

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      // Distance in meters, convert to kilometers
      const distanceKm = route.distance / 1000
      console.log(`OSRM Distance: ${distanceKm.toFixed(2)} km (raw: ${route.distance}m)`)
      return distanceKm
    }

    return null
  } catch (error) {
    console.error("Error fetching driving distance from OSRM:", error)
    return null
  }
}

// Fallback Haversine distance calculation
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function fetchPharmaciesWithLocation(userLatitude: number, userLongitude: number) {
  const supabase = await createClient()

  try {
    // First, get all verified pharmacies with coordinates
    const { data: pharmacies, error } = await supabase
      .from("pharmacy_profiles")
      .select("id, pharmacy_name, latitude, longitude, address, is_verified")
      .eq("is_verified", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null)

    if (error) {
      console.error("[v0] Error fetching pharmacies:", error)
      return []
    }

    if (!pharmacies || pharmacies.length === 0) {
      return []
    }

    // Filter pharmacies that have active subscriptions
    const pharmaciesWithActiveSubscriptions = []

    for (const pharmacy of pharmacies) {
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("pharmacy_id", pharmacy.id)
        .eq("status", "active")

      console.log(`Pharmacy ${pharmacy.pharmacy_name}: ${subscriptions?.length || 0} active subscriptions`)

      if (subscriptions && subscriptions.length > 0) {
        // Check if any subscription is still valid
        const hasValidSubscription = subscriptions.some(sub => {
          const endDate = new Date(sub.end_date)
          const now = new Date()
          console.log(`Subscription end: ${endDate.toISOString()}, now: ${now.toISOString()}, valid: ${endDate > now}`)
          return endDate > now
        })

        if (hasValidSubscription) {
          pharmaciesWithActiveSubscriptions.push(pharmacy)
        }
      }
    }

    console.log(`Found ${pharmaciesWithActiveSubscriptions.length} pharmacies with active subscriptions out of ${pharmacies.length} verified pharmacies`)

    // Calculate distances for all pharmacies (with improved OSRM driving distance, fallback to Haversine)
    const pharmaciesWithDistancePromises = pharmaciesWithActiveSubscriptions.map(async (pharmacy: any) => {
      let distance: number

      // Try to get driving distance from OSRM with improved accuracy
      const drivingDistance = await fetchDrivingDistance(
        [userLatitude, userLongitude],
        [pharmacy.latitude, pharmacy.longitude]
      )

      if (drivingDistance !== null && drivingDistance > 0) {
        distance = drivingDistance
        console.log(`✓ Driving distance for ${pharmacy.pharmacy_name}: ${distance.toFixed(1)} km`)
      } else {
        // Fallback to Haversine distance with better precision
        const haversineDistance = calculateHaversineDistance(
          userLatitude,
          userLongitude,
          pharmacy.latitude,
          pharmacy.longitude
        )

        // Apply a correction factor for road distance estimation (typically 1.1-1.3x straight line)
        // This gives a more realistic estimate when routing fails
        distance = haversineDistance * 1.2
        console.log(`⚠ Fallback estimated distance for ${pharmacy.pharmacy_name}: ${distance.toFixed(1)} km (Straight line: ${haversineDistance.toFixed(1)} km)`)
      }

      return {
        id: pharmacy.id,
        name: pharmacy.pharmacy_name,
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
        rating: 4.5,
        status: "مفتوح" as "مفتوح" | "مغلق",
        is_verified: pharmacy.is_verified,
        distance: Number.parseFloat(distance.toFixed(1)),
      }
    })

    const pharmaciesWithDistance = await Promise.all(pharmaciesWithDistancePromises)

    // Filter and sort pharmacies by distance (50 km maximum radius)
    const filteredPharmacies = pharmaciesWithDistance
      .filter((p: any) => p.distance <= 50) // 50 كم = الحد الأقصى
      .sort((a: any, b: any) => a.distance - b.distance)
    
    console.log(`✅ Final result: ${filteredPharmacies.length} pharmacies returned (filtered from ${pharmaciesWithDistance.length})`)
    console.log("🔷 Pharmacies to return:", filteredPharmacies.map(p => ({ name: p.name, distance: p.distance })))
    
    return filteredPharmacies
  } catch (error) {
    console.error("[v0] Error in fetchPharmaciesWithLocation:", error)
    return []
  }
}
