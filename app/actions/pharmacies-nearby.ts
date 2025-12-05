"use server"

import { createClient as createAdminClient } from "@supabase/supabase-js"

interface PharmacyWithDistance {
  id: string
  pharmacy_name: string
  latitude: number
  longitude: number
  distance: number
  address?: string
  phone?: string
  is_verified: boolean
}

// Haversine formula to calculate distance between two coordinates
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c * 1.2 // Apply 1.2x correction factor for road distance
}

export async function getPharmaciesNearby(
  userLatitude: number,
  userLongitude: number,
  maxDistance: number = 50
): Promise<PharmacyWithDistance[]> {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    console.log(`🔷 Fetching pharmacies near (${userLatitude}, ${userLongitude}) within ${maxDistance}km`)

    // Get all verified pharmacies with active subscriptions
    const { data: pharmacies, error } = await supabase
      .from("pharmacy_profiles")
      .select("*")
      .eq("is_verified", true)

    if (error) {
      console.error("❌ Error fetching pharmacies:", error)
      return []
    }

    if (!pharmacies || pharmacies.length === 0) {
      console.log("⚠️ No pharmacies found")
      return []
    }

    // Calculate distances and filter by max distance
    const pharmaciesWithDistance = pharmacies
      .map((pharmacy: any) => {
        const distance = calculateHaversineDistance(
          userLatitude,
          userLongitude,
          pharmacy.latitude,
          pharmacy.longitude
        )

        return {
          id: pharmacy.id,
          pharmacy_name: pharmacy.pharmacy_name,
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          address: pharmacy.address,
          phone: pharmacy.phone,
          is_verified: pharmacy.is_verified,
        }
      })
      .filter((p) => p.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)

    console.log(`✅ Found ${pharmaciesWithDistance.length} pharmacies within ${maxDistance}km`)
    return pharmaciesWithDistance
  } catch (error) {
    console.error("❌ Error in getPharmaciesNearby:", error)
    return []
  }
}
