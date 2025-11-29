"use server"

import { createClient } from "@/lib/supabase/server"

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // نصف قطر الأرض بالكيلومترات
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // المسافة بالكيلومترات
}

export async function sendPrescriptionToNearbyPharmacies(
  prescriptionId: string,
  userLatitude: number,
  userLongitude: number
) {
  const supabase = await createClient()

  try {
    // جلب جميع الصيدليات المفعلة مع مواقعها
    const { data: pharmacies, error: pharmaciesError } = await supabase
      .from("profiles")
      .select("id, latitude, longitude, is_active, subscription_expires_at")
      .eq("role", "pharmacy")
      .eq("is_active", true)

    if (pharmaciesError) throw pharmaciesError

    // تصفية الصيدليات القريبة والمشتركة
    const nearbyPharmacies = []

    for (const pharmacy of pharmacies) {
      if (!pharmacy.latitude || !pharmacy.longitude) continue

      // التحقق من وجود اشتراك نشط في جدول الاشتراكات
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("pharmacy_id", pharmacy.id)
        .eq("status", "active")
        .gte("end_date", new Date().toISOString())
        .single()

      if (!subscription) continue

      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        pharmacy.latitude,
        pharmacy.longitude
      )

      if (distance <= 50) { // أقل من 50 كم
        nearbyPharmacies.push(pharmacy)
      }
    }

    // إنشاء إشعارات للصيدليات القريبة فقط
    const notifications = nearbyPharmacies.map((pharmacy) => ({
      user_id: pharmacy.id,
      title: "وصفة طبية جديدة",
      message: `وصلتك وصفة طبية جديدة من مريض قريب منك`,
      type: "new_prescription",
      prescription_id: prescriptionId,
    }))

    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notifications)

      if (notificationError) throw notificationError
    }

    return { success: true, count: notifications.length }
  } catch (error) {
    console.error("[v0] Error sending prescription:", error)
    return { success: false, error }
  }
}

export async function getUserPrescriptions(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching prescriptions:", error)
    return []
  }

  return data || []
}
