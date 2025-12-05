import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const { pharmacyId } = await request.json()

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { error } = await supabase
      .from("pharmacy_profiles")
      .delete()
      .eq("id", pharmacyId)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error rejecting pharmacy:", error)
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}
