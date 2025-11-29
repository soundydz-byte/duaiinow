"use client"

import { PharmacyBottomNav } from "@/components/layout/pharmacy-bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PendingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 animate-spin" />
            طلب قيد الانتظار
          </h1>
          <p className="text-blue-50 text-sm mt-2">يتم مراجعة طلب اشتراكك</p>
        </div>
      </header>

      <main className="p-4 flex items-center justify-center min-h-[60vh]">
        <Card className="border-2 border-yellow-200 shadow-lg rounded-2xl bg-gradient-to-br from-yellow-50 to-white max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-2">
              <Clock className="h-10 w-10 text-yellow-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-yellow-900">شكراً لك!</h2>
            <p className="text-gray-700">تم استقبال طلب اشتراكك بنجاح</p>
            <p className="text-sm text-gray-600">سيتم مراجعة وصل الدفع الخاص بك قريباً من قبل فريق الإدارة</p>
            <p className="text-sm font-semibold text-yellow-700 mt-4">عادة ما تستغرق المراجعة من 1-24 ساعة</p>

            <Button
              onClick={() => router.push("/pharmacy/dashboard")}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl mt-6"
            >
              <ArrowRight className="ml-2 h-5 w-5" />
              العودة للوحة الإدارة
            </Button>
          </CardContent>
        </Card>
      </main>

      <PharmacyBottomNav />
    </div>
  )
}
