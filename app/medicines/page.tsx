import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pill, Plus, Calendar, Clock, Sparkles, Heart } from 'lucide-react'
import Link from "next/link"
import { MedicineBoxCharacter } from "@/components/illustrations/medicine-box-character"

export default async function MedicinesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: medicines } = await supabase
    .from("user_medicines")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                <Pill className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  أدويتي
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-emerald-50 text-sm">تتبع أدويتك ومواعيدها بسهولة</p>
              </div>
            </div>
            <Button
              asChild
              className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-full shadow-lg cute-button"
            >
              <Link href="/medicines/add">
                <Plus className="h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {medicines && medicines.length > 0 ? (
          <div className="space-y-3">
            {medicines.map((medicine) => (
              <Link key={medicine.id} href={`/medicines/${medicine.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cute-card border-2 border-emerald-100/50 rounded-2xl bg-gradient-to-br from-white to-emerald-50/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-emerald-900 mb-1">{medicine.medicine_name}</h3>

                        {medicine.pharmacy_name && (
                          <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                            <span>من صيدلية: {medicine.pharmacy_name}</span>
                          </div>
                        )}

                        {medicine.pharmacy_id && (
                          <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 rounded-full text-xs font-semibold border border-rose-200">
                            <Heart className="h-3.5 w-3.5 fill-rose-600" />
                            <span>دواء من الصيدلية</span>
                          </div>
                        )}

                        {medicine.dosage && (
                          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full" />
                            الجرعة: {medicine.dosage}
                          </p>
                        )}

                        {medicine.frequency && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2 bg-emerald-50 w-fit px-3 py-1.5 rounded-full">
                            <Clock className="h-4 w-4 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">{medicine.frequency}</span>
                          </div>
                        )}

                        {medicine.start_date && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            <span>
                              من {new Date(medicine.start_date).toLocaleDateString("en-US")}
                              {medicine.end_date && ` إلى ${new Date(medicine.end_date).toLocaleDateString("en-US")}`}
                            </span>
                          </div>
                        )}

                        {medicine.reminder_enabled && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                            <Clock className="h-3.5 w-3.5" />
                            <span>التذكير مفعل</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full shadow-md">
                        <Pill className="h-7 w-7 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center border-2 border-dashed border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-sm">
            <MedicineBoxCharacter className="w-36 h-36 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-emerald-900">لا توجد أدوية بعد</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              ابدأ بإضافة أدويتك لتتبع مواعيدها بسهولة
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 cute-button shadow-lg"
            >
              <Link href="/medicines/add">
                <Plus className="ml-2 h-5 w-5" />
                إضافة دواء جديد
              </Link>
            </Button>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
