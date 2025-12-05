"use server"

import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function getAdminStats() {
  // Use SERVICE ROLE key to bypass RLS policies
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    console.log("🔷 [Server Action] Fetching admin stats...")

    // Get users count
    const { count: usersCount, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "user")

    if (usersError) {
      console.error("❌ Users Error:", usersError)
    } else {
      console.log(`✅ Users Count: ${usersCount}`)
    }

    // Get pharmacies count
    const { count: pharmaciesCount, error: pharmaciesError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "pharmacy")

    if (pharmaciesError) {
      console.error("❌ Pharmacies Error:", pharmaciesError)
    } else {
      console.log(`✅ Pharmacies Count: ${pharmaciesCount}`)
    }

    // Get prescriptions count
    const { count: prescriptionsCount, error: prescriptionsError } = await supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })

    if (prescriptionsError) {
      console.error("❌ Prescriptions Error:", prescriptionsError)
    } else {
      console.log(`✅ Prescriptions Count: ${prescriptionsCount}`)
    }

    // Get pending subscriptions count
    const { count: pendingSubscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    if (subError) {
      console.error("❌ Pending Subscriptions Error:", subError)
    } else {
      console.log(`✅ Pending Subscriptions Count: ${pendingSubscriptions}`)
    }

    const stats = {
      usersCount: usersCount || 0,
      pharmaciesCount: pharmaciesCount || 0,
      prescriptionsCount: prescriptionsCount || 0,
      pendingPharmacies: pendingSubscriptions || 0,
    }

    console.log("📊 Final Admin Stats:", stats)
    return stats
  } catch (error) {
    console.error("❌ Error fetching admin stats:", error)
    return {
      usersCount: 0,
      pharmaciesCount: 0,
      prescriptionsCount: 0,
      pendingPharmacies: 0,
    }
  }
}
