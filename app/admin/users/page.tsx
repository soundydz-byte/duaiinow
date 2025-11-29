import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Mail, Phone, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Get all users
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "user")
    .order("created_at", { ascending: false })

  return (
    <AdminAuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white pb-6">
      <header className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  إدارة المستخدمين
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-purple-50 text-sm">عرض وإدارة جميع المستخدمين المسجلين</p>
              </div>
            </div>
            <Button asChild className="bg-white/20 hover:bg-white/30 text-white rounded-full">
              <Link href="/admin">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {users && users.length > 0 ? (
          <div className="space-y-4">
            {users.map((userProfile) => (
              <Card
                key={userProfile.id}
                className="overflow-hidden border-2 border-purple-100 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 cute-card"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center border-2 border-purple-200">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{userProfile.full_name}</h3>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                            مستخدم نشط
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 ml-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-purple-600" />
                          <span className="text-muted-foreground">بريد إلكتروني مسجل</span>
                        </div>

                        {userProfile.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-purple-600" />
                            <span className="text-gray-900 font-medium">{userProfile.phone}</span>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground mt-3 p-2 bg-purple-50/50 rounded-lg">
                          تاريخ التسجيل: {new Date(userProfile.created_at).toLocaleDateString("en-US")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-2 border-dashed border-purple-200 bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-sm">
            <Users className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-purple-900">لا يوجد مستخدمين</h3>
            <p className="text-sm text-muted-foreground">لم يتم تسجيل أي مستخدمين بعد</p>
          </Card>
        )}
      </main>
      </div>
    </AdminAuthCheck>
  )
}
