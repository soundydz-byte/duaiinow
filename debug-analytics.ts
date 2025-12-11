// Debug script to check analytics table
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

async function debugAnalytics() {
  console.log("🔍 Debugging Analytics Table...")

  // Test 1: Check if table exists
  try {
    const { data: tableInfo, error } = await supabase
      .from("analytics_events")
      .select("*")
      .limit(1)
    
    if (error) {
      console.error("❌ Table error:", error)
      return
    }
    
    console.log("✅ Table exists")
  } catch (e) {
    console.error("❌ Error checking table:", e)
  }

  // Test 2: Count total events
  try {
    const { count, error } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
    
    if (error) {
      console.error("❌ Count error:", error)
    } else {
      console.log(`✅ Total events in DB: ${count}`)
    }
  } catch (e) {
    console.error("❌ Error counting events:", e)
  }

  // Test 3: Get sample events
  try {
    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .limit(5)
    
    if (error) {
      console.error("❌ Sample error:", error)
    } else {
      console.log(`✅ Sample events: ${JSON.stringify(data, null, 2)}`)
    }
  } catch (e) {
    console.error("❌ Error getting samples:", e)
  }
}

debugAnalytics()
