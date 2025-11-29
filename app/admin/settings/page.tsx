import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, LogOut, Shield } from "lucide-react"
import Link from "next/link"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  return (
    <AdminAuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-background pb-6">
      <header className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-7 w-7" />
              الإعدادات
            </h1>
            <p className="text-purple-100 text-sm mt-1">إعدادات النظام والإدارة</p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/admin">رجوع</Link>
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              معلومات المسؤول
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">الاسم</p>
              <p className="font-semibold">{profile.full_name}</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</p>
              <p className="font-semibold">{user?.email || "غير محدد"}</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">الصلاحية</p>
              <p className="font-semibold">مسؤول النظام</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              إعدادات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Settings className="ml-2 h-5 w-5" />
              إعدادات عامة
            </Button>
          </CardContent>
        </Card>

        <form action="/auth/signout" method="post">
          <Button variant="destructive" className="w-full" type="submit">
            <LogOut className="ml-2 h-5 w-5" />
            تسجيل الخروج
          </Button>
        </form>
      </main>
      </div>
    </AdminAuthCheck>
  )
}
