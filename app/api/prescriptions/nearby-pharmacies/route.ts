import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const { prescriptionId, userLatitude, userLongitude } = await request.json()

  if (!prescriptionId || !userLatitude || !userLongitude) {
    return Response.json(
      { error: "Missing required fields" },
      { status: 400 }
    )
  }

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Calculate distance between two coordinates
    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
      return R * c * 1.2 // 1.2x correction for road distance
    }

    // Get all verified pharmacies
    const { data: pharmacies, error: pharmaciesError } = await supabase
      .from("pharmacy_profiles")
      .select("*")
      .eq("is_verified", true)

    if (pharmaciesError) throw pharmaciesError

    // Filter pharmacies within 50km
    const nearbyPharmacies = pharmacies
      .map((p: any) => ({
        ...p,
        distance: calculateDistance(userLatitude, userLongitude, p.latitude, p.longitude),
      }))
      .filter((p: any) => p.distance <= 50)
      .sort((a: any, b: any) => a.distance - b.distance)

    console.log(`✅ Found ${nearbyPharmacies.length} pharmacies within 50km`)

    return Response.json({
      prescriptionId,
      totalPharmacies: nearbyPharmacies.length,
      pharmacies: nearbyPharmacies.map((p: any) => ({
        id: p.id,
        name: p.pharmacy_name,
        latitude: p.latitude,
        longitude: p.longitude,
        distance: Math.round(p.distance * 10) / 10,
        address: p.address,
        phone: p.phone,
      })),
    })
  } catch (error) {
    console.error("❌ Error fetching nearby pharmacies:", error)
    return Response.json(
      { error: "Failed to fetch pharmacies" },
      { status: 500 }
    )
  }
}
