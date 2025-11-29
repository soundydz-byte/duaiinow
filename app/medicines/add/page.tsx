"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, ArrowRight, Sparkles } from "lucide-react"

export default function AddMedicinePage() {
  const [medicineName, setMedicineName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [notes, setNotes] = useState("")
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!medicineName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الدواء",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول أولاً")

      const { error } = await supabase.from("user_medicines").insert({
        user_id: user.id,
        medicine_name: medicineName,
        dosage: dosage || null,
        frequency: frequency || null,
        start_date: startDate || null,
        end_date: endDate || null,
        notes: notes || null,
        reminder_enabled: reminderEnabled,
      })

      if (error) throw error

      toast({
        title: "تم إضافة الدواء بنجاح",
        description: "يمكنك الآن تتبع مواعيد دوائك",
      })

      router.push("/medicines")
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Add medicine error:", error)
      toast({
        title: "خطأ في إضافة الدواء",
        description: error instanceof Error ? error.message : "حدث خطأ ما",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
              <Plus className="h-7 w-7" />
            </div>
            إضافة دواء جديد
            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          </h1>
          <p className="text-emerald-50 text-sm">أضف دواء لتتبع مواعيده والحصول على تذكيرات</p>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-2 border-emerald-100 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-emerald-50 to-white pb-4">
              <CardTitle>معلومات الدواء</CardTitle>
              <CardDescription>أدخل تفاصيل الدواء الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="medicineName" className="font-bold text-base">
                  اسم الدواء *
                </Label>
                <Input
                  id="medicineName"
                  placeholder="مثال: بنادول، أموكسيسيلين"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  required
                  className="border-2 border-emerald-100 focus:border-emerald-300 rounded-lg h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage" className="font-bold text-base">
                  الجرعة
                </Label>
                <Input
                  id="dosage"
                  placeholder="مثال: 500 ملغ"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="border-2 border-emerald-100 focus:border-emerald-300 rounded-lg h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency" className="font-bold text-base">
                  التكرار
                </Label>
                <Input
                  id="frequency"
                  placeholder="مثال: 3 مرات يومياً"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="border-2 border-emerald-100 focus:border-emerald-300 rounded-lg h-11"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-emerald-50 to-white pb-4">
              <CardTitle>المدة الزمنية</CardTitle>
              <CardDescription>حدد فترة استخدام الدواء</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="font-bold text-base">
                    تاريخ البدء
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-2 border-emerald-100 focus:border-emerald-300 rounded-lg h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="font-bold text-base">
                    تاريخ الانتهاء
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-2 border-emerald-100 focus:border-emerald-300 rounded-lg h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-emerald-50 to-white pb-4">
              <CardTitle>ملاحظات وتذكيرات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="notes" className="font-bold text-base">
                  ملاحظات إضافية
                </Label>
                <Textarea
                  id="notes"
                  placeholder="أي ملاحظات أو تعليمات خاصة (مثل: تناول مع الطعام)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="border-2 border-emerald-100 focus:border-emerald-300 rounded-lg resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-100/50">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-emerald-300 cursor-pointer accent-emerald-600"
                />
                <Label htmlFor="reminder" className="cursor-pointer flex-1">
                  <span className="font-bold text-base">تفعيل التذكير</span>
                  <span className="text-sm text-muted-foreground block">سيتم إشعارك بمواعيد الدواء</span>
                </Label>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold shadow-lg cute-button rounded-xl"
          >
            {isSubmitting ? (
              "جاري الإضافة..."
            ) : (
              <>
                إضافة الدواء
                <ArrowRight className="mr-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}
