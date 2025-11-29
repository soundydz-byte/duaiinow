"use server"

import { createClient } from "@/lib/supabase/server"

export async function toggleFavorite(pharmacyId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("يجب تسجيل الدخول")
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from("pharmacy_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("pharmacy_id", pharmacyId)
    .single()

  if (existing) {
    // Remove from favorites
    const { error } = await supabase
      .from("pharmacy_favorites")
      .delete()
      .eq("id", existing.id)

    if (error) throw error
    return { favorited: false }
  } else {
    // Add to favorites
    const { error } = await supabase
      .from("pharmacy_favorites")
      .insert({
        user_id: user.id,
        pharmacy_id: pharmacyId,
      })

    if (error) throw error
    return { favorited: true }
  }
}

export async function getFavorites() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data } = await supabase
    .from("pharmacy_favorites")
    .select(`
      *,
      pharmacy:pharmacy_profiles(*)
    `)
    .eq("user_id", user.id)

  return data || []
}
