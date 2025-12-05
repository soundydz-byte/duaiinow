import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const { subscriptionId } = await request.json()

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "rejected" })
      .eq("id", subscriptionId)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error rejecting subscription:", error)
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}
