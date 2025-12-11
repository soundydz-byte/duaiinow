import { createClient as createAdminClient } from "@supabase/supabase-js"

export interface AnalyticsEvent {
  event_type: "page_view" | "prescription_upload" | "pharmacy_view" | "response_received" | "user_signup" | "pharmacy_signup"
  user_id?: string
  user_role?: "user" | "pharmacy" | "admin"
  page_path?: string
  metadata?: Record<string, any>
}

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function logEvent(event: AnalyticsEvent) {
  try {
    const supabase = getAdminClient()

    const { data, error } = await supabase.from("analytics_events").insert({
      event_type: event.event_type,
      user_id: event.user_id || null,
      user_role: event.user_role || null,
      page_path: event.page_path || null,
      metadata: event.metadata || {},
      timestamp: new Date().toISOString(),
    }).select()

    if (error) {
      console.error("❌ Analytics insert error:", error)
      return false
    }
    console.log(`✅ Analytics event logged: ${event.event_type}`)
    return true
  } catch (error) {
    console.error("❌ Error logging analytics:", error)
    return false
  }
}

export async function getAnalyticsStats() {
  try {
    const supabase = getAdminClient()

    // Get total events count
    const { count: totalEvents, error: countError } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("❌ Count error:", countError)
    }

    // Get all events for detailed stats
    const { data: allEvents, error: eventsError } = await supabase
      .from("analytics_events")
      .select("event_type, timestamp")
      .order("timestamp", { ascending: false })
      .limit(10000)

    if (eventsError) {
      console.error("❌ Events error:", eventsError)
    }

    // Group events by type
    const eventsByType = allEvents?.reduce((acc: any[], event: any) => {
      const existing = acc.find(e => e.event_type === event.event_type)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ event_type: event.event_type, count: 1 })
      }
      return acc
    }, []) || []

    // Get events in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: eventsLastWeek, error: weekError } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", sevenDaysAgo)

    if (weekError) {
      console.error("❌ Week error:", weekError)
    }

    // Get unique users
    const { data: uniqueUsersList, error: usersError } = await supabase
      .from("analytics_events")
      .select("user_id")
      .not("user_id", "is", null)
      .limit(10000)

    if (usersError) {
      console.error("❌ Users error:", usersError)
    }

    const uniqueUsersSet = new Set(
      uniqueUsersList?.map((e: any) => e.user_id).filter(Boolean) || []
    )
    const uniqueUsers = uniqueUsersSet.size

    const result = {
      totalEvents: totalEvents || 0,
      eventsLastWeek: eventsLastWeek || 0,
      uniqueUsers: uniqueUsers || 0,
      eventsByType: eventsByType || [],
    }

    console.log("✅ Analytics Stats Calculated:", result)
    return result
  } catch (error) {
    console.error("❌ Error getting analytics stats:", error)
    return {
      totalEvents: 0,
      eventsLastWeek: 0,
      uniqueUsers: 0,
      eventsByType: [],
    }
  }
}
