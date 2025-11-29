"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"

export async function approveSubscription(subscriptionId: string, pharmacyId: string) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("يجب تسجيل الدخول")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("يجب أن تكون مسؤولاً")

  // Get subscription details to set start and end dates
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_type")
    .eq("id", subscriptionId)
    .single()

  if (!subscription) throw new Error("الاشتراك غير موجود")

  const now = new Date()
  const startDate = now.toISOString()
  const endDate = subscription.plan_type === "monthly"
    ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() // 365 days

  // Approve subscription with dates
  const { error: subError } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      start_date: startDate,
      end_date: endDate
    })
    .eq("id", subscriptionId)

  if (subError) throw subError

  // Verify pharmacy
  const { error: pharmacyError } = await supabase
    .from("pharmacy_profiles")
    .update({ is_verified: true })
    .eq("id", pharmacyId)

  if (pharmacyError) throw pharmacyError

  // Create notification for pharmacy
  await supabase.from("notifications").insert({
    user_id: pharmacyId,
    title: "تمت الموافقة على اشتراكك",
    message: "تم اعتماد اشتراكك بنجاح وأصبحت مرئية على الخريطة",
    type: "subscription_approved",
    data: { subscription_id: subscriptionId },
  })

  revalidateTag("subscriptions")
}

export async function rejectSubscription(subscriptionId: string, pharmacyId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("يجب تسجيل الدخول")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("يجب أن تكون مسؤولاً")

  const { error } = await supabase.from("subscriptions").update({ status: "rejected" }).eq("id", subscriptionId)

  if (error) throw error

  await supabase.from("notifications").insert({
    user_id: pharmacyId,
    title: "تم رفض طلب اشتراكك",
    message: "تم رفض طلب الاشتراك. يرجى التحقق من وصل الدفع وإعادة المحاولة",
    type: "subscription_rejected",
    data: { subscription_id: subscriptionId },
  })

  revalidateTag("subscriptions")
}
