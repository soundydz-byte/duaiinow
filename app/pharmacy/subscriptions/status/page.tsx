"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PharmacyBottomNav } from "@/components/layout/pharmacy-bottom-nav"
import { Clock, CheckCircle, XCircle, Calendar, ArrowRight } from 'lucide-react'
import { formatCurrency } from "@/lib/utils/number-converter"
import Image from "next/image"

export default function SubscriptionStatusPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("pharmacy_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      console.log("Subscription data:", data)
      console.log("Subscription error:", error)

      if (data) {
        setSubscription(data)
        // Also update the pharmacy profile verification status based on subscription
        const shouldBeVerified = data.status === "active" && new Date(data.end_date) > new Date()

        console.log("Updating pharmacy verification to:", shouldBeVerified)

        const { error: updateError } = await supabase
          .from("pharmacy_profiles")
          .update({ is_verified: shouldBeVerified })
          .eq("id", user.id)

        if (updateError) {
          console.error("Error updating pharmacy verification:", updateError)
        } else {
          console.log("Pharmacy verification updated successfully")
        }
      }
      setIsLoading(false)
    }

    fetchSubscription()
  }, [router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-white"><Clock className="h-3 w-3 ml-1" /> قيد المراجعة</Badge>
      case "active":
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 ml-1" /> نشط</Badge>
      case "rejected":
        return <Badge className="bg-red-500 text-white"><XCircle className="h-3 w-3 ml-1" /> مرفوض</Badge>
      case "expired":
        return <Badge className="bg-gray-500 text-white"><Calendar className="h-3 w-3 ml-1" /> منتهي</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPlanName = (planType: string) => {
    return planType === "monthly" ? "اشتراك شهري" : "اشتراك سنوي"
  }

  const getPlanPrice = (planType: string) => {
    return planType === "monthly" ? 1500 : 12000
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">حالة الاشتراك</h1>
              <p className="text-blue-50 text-sm">تفاصيل اشتراكك الحالي</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">جاري التحميل...</p>
          </Card>
        ) : subscription ? (
          <>
            <Card className="border-2 border-blue-100 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-white border-b">
                <CardTitle className="flex items-center justify-between">
                  <span>{getPlanName(subscription.plan_type)}</span>
                  {getStatusBadge(subscription.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <span className="text-gray-700 font-medium">المبلغ:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(getPlanPrice(subscription.plan_type))}
                  </span>
                </div>

                {subscription.start_date && (
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-200">
                    <span className="text-gray-700 font-medium">تاريخ البداية:</span>
                    <span className="font-bold text-gray-900">
                      {new Date(subscription.start_date).toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                )}

                {subscription.end_date && (
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-200">
                    <span className="text-gray-700 font-medium">تاريخ الانتهاء:</span>
                    <span className="font-bold text-gray-900">
                      {new Date(subscription.end_date).toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                )}

                {subscription.created_at && (
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-200">
                    <span className="text-gray-700 font-medium">تاريخ الطلب:</span>
                    <span className="text-gray-900">
                      {new Date(subscription.created_at).toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {subscription.receipt_url && (
              <Card className="border-2 border-blue-100 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
                  <CardTitle>وصل الدفع المرسل</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="relative w-full rounded-2xl overflow-hidden border-2 border-blue-300 bg-white">
                    <Image
                      src={subscription.receipt_url || "/placeholder.svg"}
                      alt="وصل الدفع"
                      width={600}
                      height={400}
                      className="w-full h-auto object-contain"
                      unoptimized
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {subscription.status === "pending" && (
              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardContent className="p-6 text-center">
                  <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-3" />
                  <p className="font-bold text-yellow-900 mb-2">طلبك قيد المراجعة</p>
                  <p className="text-sm text-yellow-700">
                    سيتم مراجعة طلبك من قبل الإدارة قريباً
                  </p>
                </CardContent>
              </Card>
            )}

            {subscription.status === "rejected" && (
              <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-3" />
                  <p className="font-bold text-red-900 mb-2">تم رفض طلبك</p>
                  <p className="text-sm text-red-700 mb-4">
                    يرجى التحقق من وصل الدفع والمحاولة مرة أخرى
                  </p>
                  <Button 
                    onClick={() => router.push('/pharmacy/subscriptions')}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    إعادة المحاولة
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">لا يوجد اشتراك حالي</p>
              <Button 
                onClick={() => router.push('/pharmacy/subscriptions')}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                اشترك الآن
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <PharmacyBottomNav />
    </div>
  )
}
