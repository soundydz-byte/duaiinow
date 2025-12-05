import { createClient as createAdminClient } from "@supabase/supabase-js"

export interface AnalyticsEvent {
  event_type: "page_view" | "prescription_upload" | "pharmacy_view" | "response_received" | "user_signup" | "pharmacy_signup"
  user_id?: string
  user_role?: "user" | "pharmacy" | "admin"
  page_path?: string
  metadata?: Record<string, any>
}

export async function logEvent(event: AnalyticsEvent) {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { error } = await supabase.from("analytics_events").insert({
      event_type: event.event_type,
      user_id: event.user_id || null,
      user_role: event.user_role || null,
      page_path: event.page_path || null,
      metadata: event.metadata || {},
      timestamp: new Date().toISOString(),
    })

    if (error) throw error
    console.log(`✅ Analytics event logged: ${event.event_type}`)
  } catch (error) {
    console.error("❌ Error logging analytics:", error)
  }
}

export async function getAnalyticsStats() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Get total events
    const { count: totalEvents } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })

    // Get events by type
    const { data: allEvents } = await supabase
      .from("analytics_events")
      .select("event_type")

    // Group events by type manually
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
    const { count: eventsLastWeek } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", sevenDaysAgo)

    // Get unique users
    const { count: uniqueUsers } = await supabase
      .from("analytics_events")
      .select("user_id", { count: "exact", head: true })
      .neq("user_id", null)

    return {
      totalEvents: totalEvents || 0,
      eventsLastWeek: eventsLastWeek || 0,
      uniqueUsers: uniqueUsers || 0,
      eventsByType: eventsByType || [],
    }
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
