import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PharmacyBottomNav } from "@/components/layout/pharmacy-bottom-nav"
import { Card } from "@/components/ui/card"
import { Bell } from "lucide-react"

export default async function PharmacyNotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-7 w-7" />
          الإشعارات
        </h1>
        <p className="text-blue-100 text-sm mt-1">جميع إشعاراتك في مكان واحد</p>
      </header>

      <main className="p-4">
        <Card className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-2">لا توجد إشعارات</h3>
          <p className="text-sm text-muted-foreground">سيتم إشعارك عند وصول وصفات جديدة</p>
        </Card>
      </main>

      <PharmacyBottomNav />
    </div>
  )
}
