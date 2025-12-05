"use client"

import { Button } from "@/components/ui/button"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Users, Building2, FileText, Settings, TrendingUp, Sparkles, Wrench, Activity } from 'lucide-react'
import { fixSubscriptionApproval } from "@/app/actions/admin-fix-subscriptions"
import { useToast } from "@/hooks/use-toast"
import { getAnalyticsStats } from "@/hooks/use-analytics"
import Link from "next/link"
import Image from "next/image"
import { AdminLogoutButton } from "@/components/admin/logout-button"
import { getAdminStats } from "@/app/actions/admin-stats"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isFixing, setIsFixing] = useState(false)
  const [stats, setStats] = useState({
    usersCount: 0,
    pharmaciesCount: 0,
    prescriptionsCount: 0,
    pendingPharmacies: 0,
  })
  const [analyticsStats, setAnalyticsStats] = useState({
    totalEvents: 0,
    eventsLastWeek: 0,
    uniqueUsers: 0,
    eventsByType: [],
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("🔷 Fetching admin stats from server...")
        const fetchedStats = await getAdminStats()
        
        console.log("📊 Fetched Admin Stats:", fetchedStats)
        setStats(fetchedStats)

        // Fetch analytics stats
        const analytics = await getAnalyticsStats()
        console.log("📊 Fetched Analytics Stats:", analytics)
        setAnalyticsStats(analytics)
      } catch (error) {
        console.error("❌ Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleFixSubscriptions = async () => {
    setIsFixing(true)
    try {
      const result = await fixSubscriptionApproval()
      if (result.success) {
        toast({
          title: "تم الإصلاح بنجاح",
          description: result.message,
        })
        // Refresh stats
        window.location.reload()
      } else {
        toast({
          title: "خطأ في الإصلاح",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      })
    } finally {
      setIsFixing(false)
    }
  }

  if (isLoading) {
    return (
      <AdminAuthCheck>
        <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-purple-600 font-bold">جاري التحميل...</p>
          </div>
        </div>
      </AdminAuthCheck>
    )
  }

  return (
    <AdminAuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white pb-6">
        <header className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white p-8 rounded-b-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                  <img src="/images/logo.png" alt="دوائي" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    لوحة الإدارة
                    <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                  </h1>
                  <p className="text-purple-100 text-sm mt-1">مرحباً بك يا مسؤول</p>
                </div>
              </div>
              <AdminLogoutButton />
            </div>

            <div className="grid grid-cols-4 gap-3">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.usersCount}</p>
                  <p className="text-xs text-purple-100 font-medium mt-1">مستخدم</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.pharmaciesCount}</p>
                  <p className="text-xs text-purple-100 font-medium mt-1">صيدلية</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.prescriptionsCount}</p>
                  <p className="text-xs text-purple-100 font-medium mt-1">وصفة</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.pendingPharmacies}</p>
                  <p className="text-xs text-purple-100 font-medium mt-1">قيد المراجعة</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-8">
          {/* Analytics Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-purple-900">التحليلات</h2>
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-2 border-blue-100 shadow-md">
                <CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-600 mb-2">إجمالي الأحداث</p>
                  <p className="text-3xl font-bold text-blue-600">{analyticsStats.totalEvents}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-100 shadow-md">
                <CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-600 mb-2">هذا الأسبوع</p>
                  <p className="text-3xl font-bold text-green-600">{analyticsStats.eventsLastWeek}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-orange-100 shadow-md">
                <CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-600 mb-2">المستخدمين النشطين</p>
                  <p className="text-3xl font-bold text-orange-600">{analyticsStats.uniqueUsers}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-pink-100 shadow-md">
                <CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-600 mb-2">أنواع الأحداث</p>
                  <p className="text-3xl font-bold text-pink-600">{analyticsStats.eventsByType.length}</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-purple-900">الإدارة السريعة</h2>
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                asChild
                className="h-28 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 flex-col gap-3 rounded-2xl shadow-lg cute-button"
                onClick={() => router.push('/admin/users')}
              >
                <Link href="/admin/users">
                  <Users className="h-8 w-8" />
                  <span className="text-base font-bold">إدارة المستخدمين</span>
                  <span className="text-xs text-purple-100">{stats.usersCount} مستخدمين</span>
                </Link>
              </Button>
              <Button
                asChild
                className="h-28 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex-col gap-3 rounded-2xl shadow-lg cute-button relative"
                onClick={() => router.push('/admin/pharmacies')}
              >
                <Link href="/admin/pharmacies">
                  <Building2 className="h-8 w-8" />
                  <span className="text-base font-bold">إدارة الصيدليات</span>
                  <span className="text-xs text-blue-100">{stats.pharmaciesCount} صيدلية</span>
                  {stats.pendingPharmacies && stats.pendingPharmacies > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg animate-pulse">
                      {stats.pendingPharmacies}
                    </span>
                  )}
                </Link>
              </Button>
              <Button
                asChild
                className="h-28 bg-white border-2 border-purple-200 text-purple-900 hover:bg-purple-50 flex-col gap-3 rounded-2xl shadow-md cute-button"
                onClick={() => router.push('/admin/prescriptions')}
              >
                <Link href="/admin/prescriptions">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <span className="text-base font-bold">الوصفات</span>
                  <span className="text-xs text-muted-foreground">{stats.prescriptionsCount} وصفة</span>
                </Link>
              </Button>
              <Button
                asChild
                className="h-28 bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 flex-col gap-3 rounded-2xl shadow-lg cute-button relative"
                onClick={() => router.push('/admin/subscriptions')}
              >
                <Link href="/admin/subscriptions">
                  <FileText className="h-8 w-8" />
                  <span className="text-base font-bold">الاشتراكات</span>
                  <span className="text-xs text-yellow-100">قيد المراجعة</span>
                  {stats.pendingPharmacies && stats.pendingPharmacies > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg animate-pulse">
                      {stats.pendingPharmacies}
                    </span>
                  )}
                </Link>
              </Button>
              <Button
                asChild
                className="h-28 bg-white border-2 border-purple-200 text-purple-900 hover:bg-purple-50 flex-col gap-3 rounded-2xl shadow-md cute-button"
                onClick={() => router.push('/admin/settings')}
              >
                <Link href="/admin/settings">
                  <Settings className="h-8 w-8 text-purple-600" />
                  <span className="text-base font-bold">الإعدادات</span>
                  <span className="text-xs text-muted-foreground">تحكم كامل</span>
                </Link>
              </Button>
              <Button
                onClick={handleFixSubscriptions}
                disabled={isFixing}
                className="h-28 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex-col gap-3 rounded-2xl shadow-lg cute-button"
              >
                <Wrench className="h-8 w-8" />
                <span className="text-base font-bold">
                  {isFixing ? "جاري الإصلاح..." : "إصلاح الاشتراكات"}
                </span>
                <span className="text-xs text-red-100">حل جذري للمشاكل</span>
              </Button>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">لوحة النشاط</h2>
            <Card className="p-12 text-center border-2 border-dashed border-purple-200 bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-sm">
              <TrendingUp className="h-16 w-16 text-purple-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2 text-purple-900">النشاط الأخير</h3>
              <p className="text-sm text-muted-foreground">سيتم عرض آخر الأنشطة والتحديثات هنا</p>
            </Card>
          </section>
        </main>
      </div>
    </AdminAuthCheck>
  )
}
