import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const { pharmacyId } = await request.json()

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // First, verify the pharmacy
    const { error: verifyError } = await supabase
      .from("pharmacy_profiles")
      .update({ is_verified: true })
      .eq("id", pharmacyId)

    if (verifyError) throw verifyError

    // Create a default subscription (30 days trial)
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        pharmacy_id: pharmacyId,
        plan_type: "monthly",
        receipt_url: "trial_subscription",
        status: "active",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

    if (subscriptionError) throw subscriptionError

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error approving pharmacy:", error)
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}
