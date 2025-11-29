"use client"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PharmacyBottomNav } from "@/components/layout/pharmacy-bottom-nav"
import { Check, Sparkles, CreditCard, ArrowRight } from 'lucide-react'
import { toArabicNumber } from "@/lib/utils/number-converter"

export default function SubscriptionsPage() {
  const router = useRouter()

  const plans = [
    {
      id: "monthly",
      name: "اشتراك شهري",
      price: 1500,
      period: "شهر واحد",
      features: ["الوصول للوصفات", "الظهور على الخريطة", "تلقي الإشعارات", "دعم العملاء"],
      popular: false,
    },
    {
      id: "yearly",
      name: "اشتراك سنوي",
      price: 12000,
      period: "سنة كاملة",
      features: ["جميع مميزات الشهري", "خصم ٣٤٪", "ترقية أولويات", "دعم VIP"],
      popular: true,
    },
  ]

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                خطط الاشتراك
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-blue-50 text-sm mt-2">اختر الخطة المناسبة لصيدليتك</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <Button
          onClick={() => router.push('/pharmacy/subscriptions/status')}
          variant="outline"
          className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 h-12 rounded-xl font-bold mb-2"
        >
          عرض حالة اشتراكي
        </Button>

        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-2 shadow-lg rounded-2xl overflow-hidden transition-all ${
              plan.popular ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-white" : "border-blue-100 bg-white"
            }`}
          >
            {plan.popular && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-2 px-4 text-center font-bold">
                الخطة الأفضل
              </div>
            )}

            <CardContent className="p-6 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{plan.period}</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold text-blue-600">{toArabicNumber(plan.price)}</span>
                  <span className="text-gray-600 text-sm mr-1">دج</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-1">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => router.push(`/pharmacy/subscriptions/payment?plan=${plan.id}`)}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg rounded-xl mt-4"
              >
                <CreditCard className="ml-2 h-5 w-5" />
                اختر هذه الخطة
              </Button>
            </CardContent>
          </Card>
        ))}
      </main>

      <PharmacyBottomNav />
    </div>
  )
}
