import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function GET() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data, error } = await supabase
      .from("pharmacy_profiles")
      .select(
        `
        *,
        profile:profiles(*)
      `
      )
      .order("created_at", { ascending: false })

    if (error) throw error

    return Response.json(data || [])
  } catch (error) {
    console.error("Error fetching pharmacies:", error)
    return Response.json([], { status: 500 })
  }
}
