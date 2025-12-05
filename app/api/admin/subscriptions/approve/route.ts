import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const { subscriptionId, pharmacyId, planType } = await request.json()

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const now = new Date()
    const endDate = new Date(now)
    if (planType === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (planType === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    // Update subscription to active
    const { error: subError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        start_date: now.toISOString(),
        end_date: endDate.toISOString()
      })
      .eq("id", subscriptionId)

    if (subError) throw subError

    // Update pharmacy profile to verified
    const { error: pharmacyError } = await supabase
      .from("pharmacy_profiles")
      .update({ is_verified: true })
      .eq("id", pharmacyId)

    if (pharmacyError) throw pharmacyError

    // Create notification
    await supabase.from("notifications").insert({
      user_id: pharmacyId,
      title: "تمت الموافقة على اشتراكك",
      message: "تم اعتماد اشتراكك بنجاح وأصبحت مرئية على الخريطة",
      type: "subscription_approved",
      data: { subscription_id: subscriptionId },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error approving subscription:", error)
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}
