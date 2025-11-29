import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, FileText, CheckCircle, Clock, Sparkles } from "lucide-react"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getIcon = (type: string) => {
    switch (type) {
      case "prescription":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "response":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "reminder":
        return <Clock className="h-5 w-5 text-orange-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
              <Bell className="h-7 w-7" />
            </div>
            الإشعارات
            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          </h1>
          <p className="text-emerald-50 text-sm">جميع تحديثاتك في مكان واحد</p>
        </div>
      </header>

      <main className="p-4">
        {notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`overflow-hidden hover:shadow-lg transition-all duration-300 cute-card rounded-2xl border-2 ${
                  notification.read
                    ? "bg-white border-emerald-100/30"
                    : "bg-gradient-to-br from-emerald-50 to-white border-emerald-300 shadow-md"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div
                      className={`flex-shrink-0 p-3 rounded-full ${notification.read ? "bg-gray-100" : "bg-emerald-100"}`}
                    >
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-base text-gray-900">{notification.title}</h3>
                        {!notification.read && (
                          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs border-0 shadow-md animate-pulse">
                            جديد
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{notification.message}</p>

                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString("ar-SA")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center border-2 border-dashed border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-sm">
            <Bell className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-emerald-900">لا توجد إشعارات</h3>
            <p className="text-sm text-muted-foreground">سيتم إشعارك عند وجود تحديثات جديدة</p>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
