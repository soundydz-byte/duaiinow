import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PharmacyBottomNav } from "@/components/layout/pharmacy-bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, Clock, TrendingUp, Sparkles, Building2 } from "lucide-react"
import { PharmacyCharacter } from "@/components/illustrations/pharmacy-character"
import Link from "next/link"
import Image from "next/image"

export default async function PharmacyDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get pharmacy profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "pharmacy") {
    redirect("/home")
  }

  const { data: pharmacyProfile } = await supabase.from("pharmacy_profiles").select("*").eq("id", user.id).single()

  // Check if pharmacy is verified and has active subscription
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("status, end_date")
    .eq("pharmacy_id", user.id)
    .eq("status", "active")
    .gte("end_date", new Date().toISOString())

  const isActive = subscriptions && subscriptions.length > 0

  // Get pending prescriptions count - only if subscription is active
  const { count: pendingCount } = isActive ? await supabase
    .from("prescriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending") : { count: 0 }

  // Get responded prescriptions count
  const { count: respondedCount } = await supabase
    .from("prescription_responses")
    .select("*", { count: "exact", head: true })
    .eq("pharmacy_id", user.id)

  // Get completed prescriptions count
  const { count: completedCount } = await supabase
    .from("prescription_responses")
    .select("*", { count: "exact", head: true })
    .eq("pharmacy_id", user.id)
    .eq("status", "completed")

  // Get recent prescriptions - only if subscription is active
  const { data: recentPrescriptions } = isActive ? await supabase
    .from("prescriptions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5) : { data: [] }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
                <Building2 className="w-full h-full text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{pharmacyProfile?.pharmacy_name || "صيدلية"}</h1>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-blue-50 text-sm">{profile.full_name}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-lg cute-card">
              <CardContent className="p-4 text-center">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{pendingCount || 0}</p>
                <p className="text-xs text-blue-50 font-medium">قيد الانتظار</p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-lg cute-card">
              <CardContent className="p-4 text-center">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{respondedCount || 0}</p>
                <p className="text-xs text-blue-50 font-medium">تم الرد</p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-lg cute-card">
              <CardContent className="p-4 text-center">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{completedCount || 0}</p>
                <p className="text-xs text-blue-50 font-medium">مكتملة</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <section>
          <div className="grid grid-cols-2 gap-4">
            <Button
              asChild
              className="h-28 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex-col gap-2 shadow-lg cute-button border-0 rounded-2xl relative"
            >
              <Link href="/pharmacy/prescriptions">
                <div className="bg-white/20 rounded-full p-2 mb-1">
                  <FileText className="h-7 w-7" />
                </div>
                <span className="font-semibold">الوصفات الجديدة</span>
                {pendingCount && pendingCount > 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 shadow-lg animate-pulse">
                    {pendingCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-28 flex-col gap-2 border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/50 hover:bg-blue-50 cute-button rounded-2xl shadow-md"
            >
              <Link href="/pharmacy/profile">
                <div className="bg-blue-100 rounded-full p-2 mb-1">
                  <CheckCircle className="h-7 w-7 text-blue-600" />
                </div>
                <span className="font-semibold text-blue-700">ملف الصيدلية</span>
              </Link>
            </Button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <div className="bg-blue-100 rounded-full p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              الوصفات الأخيرة
            </h2>
            {recentPrescriptions && recentPrescriptions.length > 0 && (
              <Link href="/pharmacy/prescriptions" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                عرض الكل ←
              </Link>
            )}
          </div>

          {recentPrescriptions && recentPrescriptions.length > 0 ? (
            <div className="space-y-3">
              {recentPrescriptions.map((prescription) => (
                <Link key={prescription.id} href={`/pharmacy/prescriptions/${prescription.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all cute-card border-2 border-blue-100/50 rounded-2xl bg-gradient-to-br from-white to-blue-50/20">
                    <div className="flex gap-4 p-4">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-200 shadow-md">
                      <Image
                          src={prescription.images_urls?.[0] || "/placeholder.svg"}
                          alt="وصفة طبية"
                          fill
                          className="object-cover"
                          unoptimized={true}
                          priority={false}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-base text-blue-900">وصفة طبية جديدة</h3>
                          <span className="text-xs text-muted-foreground">
                            {new Date(prescription.created_at).toLocaleDateString("en-US")}
                          </span>
                        </div>

                        {prescription.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2 bg-gray-50 p-2 rounded-lg mb-2">
                            {prescription.notes}
                          </p>
                        )}

                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cute-button shadow-md"
                        >
                          الرد على الوصفة
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center border-2 border-dashed border-blue-200 bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-sm">
              <PharmacyCharacter className="w-32 h-32 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2 text-blue-900">لا توجد وصفات جديدة</h3>
              <p className="text-sm text-muted-foreground">سيتم إشعارك عند وصول وصفات جديدة من المستخدمين</p>
            </Card>
          )}
        </section>
      </main>

      <PharmacyBottomNav />
    </div>
  )
}
