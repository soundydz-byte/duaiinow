import { logEvent, getAnalyticsStats } from "@/lib/analytics"
import type { AnalyticsEvent } from "@/lib/analytics"

export async function POST(request: Request) {
  try {
    const event: AnalyticsEvent = await request.json()

    // Validate event
    if (!event.event_type) {
      return Response.json(
        { error: "Missing event_type" },
        { status: 400 }
      )
    }

    // Log the event
    await logEvent(event)

    return Response.json({
      success: true,
      message: "Event logged",
    })
  } catch (error) {
    console.error("❌ Error logging event:", error)
    return Response.json(
      { error: "Failed to log event" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = await getAnalyticsStats()
    return Response.json(stats)
  } catch (error) {
    console.error("❌ Error getting analytics stats:", error)
    return Response.json(
      { error: "Failed to get stats" },
      { status: 500 }
    )
  }
}
