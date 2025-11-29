"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Navigation, CheckCircle } from "lucide-react"

export default function ArrivedPharmacyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [prescriptionId, setPrescriptionId] = useState("")
  const [pharmacyId, setPharmacyId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleArrived = async () => {
    if (!prescriptionId || !pharmacyId) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول")

      // Notify pharmacy
      await supabase.from("notifications").insert({
        user_id: pharmacyId,
        title: "مريض وصل للصيدلية",
        message: "عميل وصل لالتقاط الأدوية",
        type: "customer_arrived",
        data: { customer_id: user.id, prescription_id: prescriptionId },
      })

      toast({
        title: "تم التنبيه",
        description: "تم إخبار الصيدلية بوصولك",
      })

      router.push("/home")
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="h-6 w-6" />
            وصلت للصيدلية
          </h1>
          <p className="text-emerald-50 text-sm mt-2">أخبر الصيدلية بوصولك</p>
        </div>
      </header>

      <main className="p-4 flex items-center justify-center min-h-[60vh]">
        <Card className="border-2 border-emerald-100 shadow-lg rounded-2xl w-full max-w-md">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-white">
            <CardTitle>تأكيد الوصول</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="font-bold">رقم الوصفة</Label>
              <Input
                placeholder="أدخل رقم الوصفة"
                value={prescriptionId}
                onChange={(e) => setPrescriptionId(e.target.value)}
                className="border-2 border-emerald-100 rounded-lg h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">معرف الصيدلية</Label>
              <Input
                placeholder="أدخل معرف الصيدلية"
                value={pharmacyId}
                onChange={(e) => setPharmacyId(e.target.value)}
                className="border-2 border-emerald-100 rounded-lg h-11"
              />
            </div>

            <Button
              onClick={handleArrived}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl"
            >
              <CheckCircle className="h-5 w-5 ml-2" />
              {isLoading ? "جاري الإرسال..." : "أخبر بوصولي"}
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
