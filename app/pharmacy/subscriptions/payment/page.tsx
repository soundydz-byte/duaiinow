"use client"

import type React from "react"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PharmacyBottomNav } from "@/components/layout/pharmacy-bottom-nav"
import { useToast } from "@/hooks/use-toast"
import { Upload, ArrowRight, AlertCircle } from 'lucide-react'
import Image from "next/image"
import { formatCurrency, toArabicNumber } from "@/lib/utils/number-converter"

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const plan = searchParams.get("plan")

  const [receipt, setReceipt] = useState<File | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const planDetails: Record<string, { name: string; price: number; days: number }> = {
    monthly: { name: "اشتراك شهري", price: 1500, days: 30 },
    yearly: { name: "اشتراك سنوي", price: 12000, days: 365 },
  }

  const currentPlan = planDetails[plan as keyof typeof planDetails]

  if (!currentPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-3" />
            <p className="font-bold text-red-900">خطة غير صحيحة</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceipt(file)
      const reader = new FileReader()
      reader.onloadend = () => setReceiptUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!receipt) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار وصل الدفع",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول")

      // Upload receipt to Supabase storage
      const fileExt = receipt.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('subscriptions')
        .upload(fileName, receipt)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('subscriptions')
        .getPublicUrl(fileName)

      // Create subscription with receipt URL
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + currentPlan.days * 24 * 60 * 60 * 1000)

      const { error: insertError } = await supabase.from("subscriptions").insert({
        pharmacy_id: user.id,
        plan_type: plan,
        receipt_url: publicUrl,
        status: "pending",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })

      if (insertError) throw insertError

      // Get admin users (role = 'admin')
      const { data: adminProfiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")

      // Create notifications for admins
      if (adminProfiles && adminProfiles.length > 0) {
        const notifications = adminProfiles.map((admin) => ({
          user_id: admin.id,
          title: "اشتراك جديد بانتظار الموافقة",
          message: `وصل اشتراك ${currentPlan.name} بقيمة ${formatCurrency(currentPlan.price)}`,
          type: "subscription_pending",
          data: { subscription_id: user.id, plan },
        }))

        await supabase.from("notifications").insert(notifications)
      }

      toast({
        title: "تم إرسال الاشتراك بنجاح",
        description: "سيتم مراجعة طلبك من قبل الإدمن قريباً",
      })

      router.push("/pharmacy/subscriptions/pending")
    } catch (error: unknown) {
      console.error("Payment error:", error)
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ ما",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

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
              <h1 className="text-2xl font-bold">{currentPlan.name}</h1>
              <p className="text-blue-50 text-sm">ارفع وصل الدفع</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="border-2 border-blue-100 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ملخص الاشتراك</span>
              <Badge className="bg-blue-500 text-white">{currentPlan.name}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-200">
              <span className="text-gray-700 font-medium">المبلغ المستحق:</span>
              <span className="text-3xl font-bold text-blue-600">{formatCurrency(currentPlan.price)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-200">
              <span className="text-gray-700 font-medium">المدة:</span>
              <span className="font-bold text-gray-900">{toArabicNumber(currentPlan.days)} يوم</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              وصل الدفع
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {!receiptUrl ? (
              <label htmlFor="receipt-upload" className="block">
                <div className="border-2 border-dashed border-blue-300 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                  <Upload className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2 text-blue-900">اضغط لاختيار الصورة</p>
                  <p className="text-sm text-gray-600">PNG, JPG حتى ٥ ميجابايت</p>
                </div>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border-4 border-blue-500 shadow-xl bg-white">
                  <Image
                    src={receiptUrl || "/placeholder.svg"}
                    alt="وصل الدفع"
                    width={600}
                    height={400}
                    className="w-full h-auto object-contain"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setReceipt(null)
                    setReceiptUrl(null)
                  }}
                  className="w-full"
                >
                  تغيير الصورة
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={!receipt || isUploading}
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg rounded-xl"
        >
          {isUploading ? "جاري الإرسال..." : "إرسال طلب الاشتراك"}
        </Button>
      </main>

      <PharmacyBottomNav />
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-4">جاري التحميل...</div>}>
      <PaymentContent />
    </Suspense>
  )
}
