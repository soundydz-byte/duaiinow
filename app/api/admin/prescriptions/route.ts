import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from("prescriptions")
      .select("id, user_id, status, created_at, notes, images_urls, has_responded")
      .order("created_at", { ascending: false })
      .limit(10000)

    if (error) throw error

    return Response.json(data || [])
  } catch (error) {
    console.error("❌ Error fetching prescriptions:", error)
    return Response.json([], { status: 500 })
  }
}
