"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pill, Clock, Calendar, Trash2, ArrowRight, AlertCircle } from "lucide-react"
import type { UserMedicine } from "@/lib/types"

export default function MedicineDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [medicine, setMedicine] = useState<UserMedicine | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchMedicine = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("user_medicines").select("*").eq("id", id).single()

      if (error) {
        console.error("[v0] Fetch medicine error:", error)
        router.push("/medicines")
        return
      }

      setMedicine(data)
      setIsLoading(false)
    }

    fetchMedicine()
  }, [id, router])

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الدواء؟")) return

    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("user_medicines").delete().eq("id", id)

      if (error) throw error

      router.push("/medicines")
      router.refresh()
    } catch (error) {
      console.error("[v0] Delete medicine error:", error)
      alert("فشل حذف الدواء")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
        <div className="text-center">
          <div className="inline-flex gap-1 mb-4">
            <div className="w-2 h-8 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-8 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-8 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
          <p className="text-muted-foreground font-medium">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!medicine) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
          <p className="font-semibold">الدواء غير موجود</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Pill className="h-6 w-6" />
                </div>
                {medicine.medicine_name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="border-2 border-emerald-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-white pb-4">
            <CardTitle>تفاصيل الدواء</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {medicine.dosage && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-100/50">
                <div className="bg-emerald-100 rounded-full p-3">
                  <Pill className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">الجرعة</p>
                  <p className="font-bold text-base">{medicine.dosage}</p>
                </div>
              </div>
            )}

            {medicine.frequency && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-100/50">
                <div className="bg-emerald-100 rounded-full p-3">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">التكرار</p>
                  <p className="font-bold text-base">{medicine.frequency}</p>
                </div>
              </div>
            )}

            {medicine.start_date && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-100/50">
                <div className="bg-emerald-100 rounded-full p-3">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">الفترة الزمنية</p>
                  <p className="font-bold text-base">
                    من {new Date(medicine.start_date).toLocaleDateString("en-US")}
                    {medicine.end_date && ` إلى ${new Date(medicine.end_date).toLocaleDateString("en-US")}`}
                  </p>
                </div>
              </div>
            )}

            {medicine.notes && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100">
                <p className="text-sm font-medium text-blue-900 mb-2">ملاحظات:</p>
                <p className="text-sm text-blue-700">{medicine.notes}</p>
              </div>
            )}

            {medicine.reminder_enabled && (
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-white rounded-2xl border-2 border-yellow-100">
                <p className="text-sm font-bold text-yellow-900 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  التذكير مفعل
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          variant="destructive"
          className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg cute-button rounded-xl"
        >
          <Trash2 className="ml-2 h-5 w-5" />
          حذف الدواء
        </Button>
      </main>

      <BottomNav />
    </div>
  )
}
