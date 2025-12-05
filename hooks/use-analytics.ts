import { useEffect } from "react"
import { usePathname } from "next/navigation"
import type { AnalyticsEvent } from "@/lib/analytics"

// Track page views
export function usePageView() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      trackEvent({
        event_type: "page_view",
        page_path: pathname,
      })
    }
  }, [pathname])
}

// Track custom events
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window !== "undefined") {
    fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }).catch((err) => {
      console.error("❌ Failed to track event:", err)
    })
  }
}

// Get analytics stats (for admin dashboard)
export async function getAnalyticsStats() {
  try {
    const response = await fetch("/api/analytics", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) throw new Error("Failed to fetch stats")
    return await response.json()
  } catch (error) {
    console.error("❌ Error fetching analytics:", error)
    return {
      totalEvents: 0,
      eventsLastWeek: 0,
      uniqueUsers: 0,
      eventsByType: [],
    }
  }
}
