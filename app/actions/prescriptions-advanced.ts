"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"

export async function findPharmaciesForPrescription(latitude: number, longitude: number, radiusKm = 30) {
  const supabase = await createClient()

  // Get all verified pharmacies
  const { data: pharmacies } = await supabase.from("pharmacy_profiles").select("*").eq("is_verified", true)

  if (!pharmacies) return []

  // Filter pharmacies within radius
  const filtered = pharmacies.filter((pharmacy) => {
    if (!pharmacy.latitude || !pharmacy.longitude) return false

    const distance = calculateDistance(latitude, longitude, Number(pharmacy.latitude), Number(pharmacy.longitude))
    return distance <= radiusKm
  })

  return filtered.sort((a, b) => {
    const distA = calculateDistance(latitude, longitude, Number(a.latitude), Number(a.longitude))
    const distB = calculateDistance(latitude, longitude, Number(b.latitude), Number(b.longitude))
    return distA - distB
  })
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function notifyPharmaciesOfPrescription(prescriptionId: string) {
  const supabase = await createClient()

  const { data: prescription } = await supabase
    .from("prescriptions")
    .select(
      `
      *,
      user:profiles(latitude, longitude)
    `,
    )
    .eq("id", prescriptionId)
    .single()

  if (!prescription || !prescription.user) return

  // Find nearby pharmacies
  const nearbyPharmacies = await findPharmaciesForPrescription(
    Number(prescription.user.latitude),
    Number(prescription.user.longitude),
    30,
  )

  // Notify each pharmacy
  for (const pharmacy of nearbyPharmacies) {
    await supabase.from("notifications").insert({
      user_id: pharmacy.id,
      title: "وصفة طبية جديدة",
      message: `وصفة طبية جديدة من مريض بالقرب من صيدليتك`,
      type: "new_prescription",
      data: {
        prescription_id: prescriptionId,
        distance: calculateDistance(
          Number(prescription.user.latitude),
          Number(prescription.user.longitude),
          Number(pharmacy.latitude),
          Number(pharmacy.longitude),
        ),
      },
    })
  }

  revalidateTag("prescriptions")
}

export async function notifyPharmacyOfArrival(
  prescriptionId: string,
  pharmacyId: string,
  userLatitude: number,
  userLongitude: number,
  pharmacyLatitude: number,
  pharmacyLongitude: number,
) {
  const supabase = await createClient()

  // Create navigation record
  await supabase.from("navigation_records").insert({
    user_id: (await supabase.auth.getUser()).data.user?.id || "",
    pharmacy_id: pharmacyId,
    prescription_id: prescriptionId,
  })

  // Notify pharmacy
  const distance = calculateDistance(userLatitude, userLongitude, pharmacyLatitude, pharmacyLongitude)

  await supabase.from("notifications").insert({
    user_id: pharmacyId,
    title: "مريض في الطريق",
    message: `مريض على بعد ${(distance * 1000).toFixed(0)} متر من صيدليتك`,
    type: "customer_nearby",
    data: {
      user_id: (await supabase.auth.getUser()).data.user?.id,
      prescription_id: prescriptionId,
    },
  })

  revalidateTag("prescriptions")
}
