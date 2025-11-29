"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PharmacyBottomNav } from "@/components/layout/pharmacy-bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, X, Send, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Prescription } from "@/lib/types"
import { toArabicNumber } from "@/lib/utils/number-converter"

interface Medicine {
  name: string
  price: number
  available: boolean
}

export default function PrescriptionDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: "", price: 0, available: true }])
  const [notes, setNotes] = useState("")
  const [estimatedTime, setEstimatedTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPrescription = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("prescriptions").select("*").eq("id", id).single()

      if (error) {
        toast({
          title: "خطأ",
          description: "فشل في تحميل الوصفة",
          variant: "destructive",
        })
        return
      }

      setPrescription(data)
      setIsLoading(false)
    }

    fetchPrescription()
  }, [id, toast])

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", price: 0, available: true }])
  }

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const updateMedicine = (index: number, field: keyof Medicine, value: string | number | boolean) => {
    const updated = [...medicines]
    updated[index] = { ...updated[index], [field]: value }
    setMedicines(updated)
  }

  const handleSubmit = async () => {
    const validMedicines = medicines.filter((m) => m.name.trim() !== "")

    if (validMedicines.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة دواء واحد على الأقل",
        variant: "destructive",
      })
      return
    }

    const totalPrice = validMedicines.reduce((sum, m) => sum + (m.available ? m.price : 0), 0)

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول")

      // Insert response
      const { error: responseError } = await supabase.from("prescription_responses").insert({
        prescription_id: params.id,
        pharmacy_id: user.id,
        available_medicines: validMedicines,
        total_price: totalPrice,
        notes: notes || null,
        estimated_ready_time: estimatedTime || null,
      })

      if (responseError) throw responseError

      // Update prescription status
      const { error: updateError } = await supabase
        .from("prescriptions")
        .update({ status: "responded" })
        .eq("id", params.id)

      if (updateError) throw updateError

      toast({
        title: "تم إرسال الرد بنجاح",
        description: "سيتم إشعار المستخدم بردك",
      })

      router.push("/pharmacy/dashboard")
      router.refresh()
    } catch (error: unknown) {
      console.error("Response error:", error)
      toast({
        title: "خطأ في إرسال الرد",
        description: error instanceof Error ? error.message : "حدث خطأ ما",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
        <div className="text-center">
          <div className="inline-flex gap-1 mb-4">
            <div className="w-2 h-8 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-8 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-8 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
          <p className="text-muted-foreground font-medium">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
        <div className="text-center">
          <p className="font-semibold">لم يتم العثور على الوصفة</p>
        </div>
      </div>
    )
  }

  const totalPrice = medicines.reduce((sum, m) => sum + (m.available ? m.price : 0), 0)

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
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
                الرد على الوصفة
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-blue-50 text-sm">أضف الأدوية المتوفرة والأسعار</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="border-2 border-blue-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-white pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="bg-blue-100 rounded-full p-2">
                <Image alt="" width={20} height={20} src="/placeholder.svg" />
              </div>
              صورة الوصفة
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative w-full rounded-2xl overflow-hidden bg-white shadow-md border-2 border-blue-200">
                    <Image
                src={prescription.images_urls?.[0] || "/placeholder.svg"}
                alt="وصفة طبية"
                width={600}
                height={400}
                className="w-full h-auto object-contain"
                unoptimized={true}
              />
            </div>
            {prescription.notes && (
              <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100">
                <p className="text-sm font-bold text-blue-900 mb-2">ملاحظات المريض:</p>
                <p className="text-sm text-muted-foreground">{prescription.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-white pb-4">
            <CardTitle>الأدوية المتوفرة</CardTitle>
            <CardDescription>أضف الأدوية المطلوبة مع الأسعار</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {medicines.map((medicine, index) => (
              <div
                key={index}
                className="p-5 border-2 border-blue-100 rounded-2xl space-y-4 bg-gradient-to-br from-white to-blue-50/20 relative hover:shadow-md transition-shadow"
              >
                {medicines.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 left-3 h-6 w-6 text-red-600 hover:bg-red-50"
                    onClick={() => removeMedicine(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                <div className="space-y-2">
                  <Label className="font-bold text-base">اسم الدواء</Label>
                  <Input
                    placeholder="مثال: بنادول، أموكسيسيلين"
                    value={medicine.name}
                    onChange={(e) => updateMedicine(index, "name", e.target.value)}
                    className="border-2 border-blue-100 focus:border-blue-300 rounded-lg h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-base">السعر (دج)</Label>
                    <Input
                      type="number"
                      placeholder="٠.٠٠"
                      value={medicine.price || ""}
                      onChange={(e) => updateMedicine(index, "price", Number.parseFloat(e.target.value) || 0)}
                      className="border-2 border-blue-100 focus:border-blue-300 rounded-lg h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-base">الحالة</Label>
                    <select
                      className="w-full h-11 rounded-lg border-2 border-blue-100 focus:border-blue-300 bg-white px-3 text-sm font-medium"
                      value={medicine.available ? "available" : "unavailable"}
                      onChange={(e) => updateMedicine(index, "available", e.target.value === "available")}
                    >
                      <option value="available">متوفر</option>
                      <option value="unavailable">غير متوفر</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200 hover:bg-blue-50 rounded-lg h-11 font-bold cute-button"
              onClick={addMedicine}
            >
              <Plus className="ml-2 h-5 w-5 text-blue-600" />
              إضافة دواء آخر
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-white pb-4">
            <CardTitle>معلومات إضافية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label className="font-bold text-base">وقت التجهيز المتوقع</Label>
              <Input
                placeholder="مثال: 30 دقيقة، ساعة واحدة"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="border-2 border-blue-100 focus:border-blue-300 rounded-lg h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-base">ملاحظات إضافية</Label>
              <Textarea
                placeholder="أي ملاحظات أو تعليمات للمريض..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="border-2 border-blue-100 focus:border-blue-300 rounded-lg resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-medium">الإجمالي النهائي</p>
                <p className="text-base font-bold text-blue-600">
                  عدد الأدوية: {toArabicNumber(medicines.filter((m) => m.name.trim()).length)}
                </p>
              </div>
              <div className="text-left bg-white rounded-2xl px-6 py-3 border-2 border-blue-200 shadow-md">
                <p className="text-sm text-muted-foreground mb-1">المبلغ</p>
                <p className="text-3xl font-bold text-blue-600">{toArabicNumber(totalPrice)}</p>
                <p className="text-xs text-blue-600 font-medium">دج</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-13 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-base shadow-lg cute-button rounded-xl"
          >
            {isSubmitting ? (
              "جاري الإرسال..."
            ) : (
              <>
                إرسال الرد
                <Send className="mr-2 h-5 w-5" />
              </>
            )}
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 h-13 bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200 hover:bg-blue-50 text-blue-700 font-bold shadow-lg cute-button rounded-xl"
          >
            <Link href={`/pharmacy/patients/${params.id}/send-medicine`}>
              إرسال الدواء للمريض
            </Link>
          </Button>
        </div>
      </main>

      <PharmacyBottomNav />
    </div>
  )
}
