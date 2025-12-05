import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function GET() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data: subsData, error: subsError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (subsError) throw subsError

    if (!subsData || subsData.length === 0) {
      return Response.json([])
    }

    const subscriptionsWithPharmacy = await Promise.all(
      subsData.map(async (sub) => {
        const { data: pharmacyData, error: pharmacyError } = await supabase
          .from("pharmacy_profiles")
          .select("*")
          .eq("id", sub.pharmacy_id)
          .single()

        return {
          ...sub,
          pharmacy: pharmacyData
        }
      })
    )

    return Response.json(subscriptionsWithPharmacy)
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return Response.json([], { status: 500 })
  }
}
