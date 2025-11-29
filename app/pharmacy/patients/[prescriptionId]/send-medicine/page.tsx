"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { PharmacyBottomNav } from "@/components/layout/pharmacy-bottom-nav"
import { ArrowRight, Send, Plus, X, Clock } from 'lucide-react'
import { sendMedicineToPatient } from "@/app/actions/pharmacy-medicines"

interface ReminderTime {
  time: string
  label: string
}

export default function SendMedicinePage({ params }: { params: { prescriptionId: string } }) {
  const prescriptionId = params.prescriptionId
  const [prescription, setPrescription] = useState<any>(null)
  const [medicines, setMedicines] = useState([{
    name: "",
    dosage: "",
    frequency: "",
    instructions: "",
    startDate: "",
    endDate: "",
    reminderTimes: [] as ReminderTime[]
  }])
  const [newReminderTime, setNewReminderTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPrescription = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("prescriptions")
        .select("*, profiles(*)")
        .eq("id", prescriptionId)
        .single()

      setPrescription(data)
    }

    fetchPrescription()
  }, [prescriptionId])

  const addMedicine = () => {
    setMedicines([...medicines, {
      name: "",
      dosage: "",
      frequency: "",
      instructions: "",
      startDate: "",
      endDate: "",
      reminderTimes: []
    }])
  }

  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index))
    }
  }

  const updateMedicine = (index: number, field: string, value: any) => {
    const updated = [...medicines]
    updated[index] = { ...updated[index], [field]: value }
    setMedicines(updated)
  }

  const addReminderTime = (medicineIndex: number) => {
    if (newReminderTime) {
      const updated = [...medicines]
      updated[medicineIndex].reminderTimes.push({ time: newReminderTime, label: newReminderTime })
      setMedicines(updated)
      setNewReminderTime("")
    }
  }

  const removeReminderTime = (medicineIndex: number, reminderIndex: number) => {
    const updated = [...medicines]
    updated[medicineIndex].reminderTimes = updated[medicineIndex].reminderTimes.filter((_, i) => i !== reminderIndex)
    setMedicines(updated)
  }

  const handleSubmit = async () => {
    // Validate all medicines
    for (let i = 0; i < medicines.length; i++) {
      const med = medicines[i]
      if (!med.name.trim() || !med.instructions.trim()) {
        toast({
          title: "خطأ",
          description: `يرجى إدخال اسم الدواء وطريقة التناول للدواء رقم ${i + 1}`,
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Send all medicines
      for (const medicine of medicines) {
        await sendMedicineToPatient({
          userId: prescription.user_id,
          prescriptionId: params.prescriptionId,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          instructions: medicine.instructions,
          startDate: medicine.startDate,
          endDate: medicine.endDate,
          reminderTimes: medicine.reminderTimes.map((r) => r.time),
        })
      }

      toast({
        title: "تم إرسال الأدوية بنجاح",
        description: "ستظهر الأدوية في قائمة أدوية المريض",
      })

      router.push("/pharmacy/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Send medicine error:", error)
      toast({
        title: "خطأ",
        description: "فشل في إرسال الأدوية",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

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
              <h1 className="text-2xl font-bold">إرسال الأدوية للمريض</h1>
              <p className="text-blue-50 text-sm">للمريض: {prescription.profiles?.full_name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {medicines.map((medicine, index) => (
          <Card key={index} className="border-2 border-blue-100 shadow-lg rounded-2xl">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-white flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  معلومات الدواء {index > 0 ? `(${index + 1})` : ''}
                </CardTitle>
                <CardDescription>أدخل تفاصيل الدواء وطريقة الاستخدام</CardDescription>
              </div>
              {medicines.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMedicine(index)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor={`medicineName-${index}`} className="font-bold">
                  اسم الدواء *
                </Label>
                <Input
                  id={`medicineName-${index}`}
                  placeholder="مثال: بنادول 500 ملغ"
                  value={medicine.name}
                  onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                  required
                  className="border-2 border-blue-100 focus:border-blue-300 rounded-lg h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`dosage-${index}`}>الجرعة</Label>
                  <Input
                    id={`dosage-${index}`}
                    placeholder="مثال: حبة واحدة"
                    value={medicine.dosage}
                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                    className="border-2 border-blue-100 focus:border-blue-300 rounded-lg h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`frequency-${index}`}>التكرار</Label>
                  <Input
                    id={`frequency-${index}`}
                    placeholder="مثال: 3 مرات يومياً"
                    value={medicine.frequency}
                    onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                    className="border-2 border-blue-100 focus:border-blue-300 rounded-lg h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`instructions-${index}`} className="font-bold">
                  طريقة التناول والتعليمات *
                </Label>
                <Textarea
                  id={`instructions-${index}`}
                  placeholder="مثال: تناول حبة واحدة بعد الأكل مع كوب ماء..."
                  value={medicine.instructions}
                  onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                  rows={4}
                  required
                  className="border-2 border-blue-100 focus:border-blue-300 rounded-lg resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${index}`}>تاريخ البدء</Label>
                  <Input
                    id={`startDate-${index}`}
                    type="date"
                    value={medicine.startDate}
                    onChange={(e) => updateMedicine(index, 'startDate', e.target.value)}
                    className="border-2 border-blue-100 focus:border-blue-300 rounded-lg h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`endDate-${index}`}>تاريخ الانتهاء</Label>
                  <Input
                    id={`endDate-${index}`}
                    type="date"
                    value={medicine.endDate}
                    onChange={(e) => updateMedicine(index, 'endDate', e.target.value)}
                    className="border-2 border-blue-100 focus:border-blue-300 rounded-lg h-11"
                  />
                </div>
              </div>

              <Card className="border border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    أوقات التذكير للدواء {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={newReminderTime}
                      onChange={(e) => setNewReminderTime(e.target.value)}
                      className="border-2 border-blue-100 focus:border-blue-300 rounded-lg h-10"
                    />
                    <Button
                      type="button"
                      onClick={() => addReminderTime(index)}
                      className="bg-blue-500 hover:bg-blue-600 rounded-lg"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {medicine.reminderTimes.length > 0 && (
                    <div className="space-y-2">
                      {medicine.reminderTimes.map((reminder, reminderIndex) => (
                        <div
                          key={reminderIndex}
                          className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200"
                        >
                          <span className="font-medium text-sm">{reminder.time}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeReminderTime(index, reminderIndex)}
                            className="h-6 w-6 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-3">
          <Button
            onClick={addMedicine}
            variant="outline"
            className="flex-1 border-2 border-blue-200 hover:bg-blue-50 rounded-xl"
          >
            <Plus className="ml-2 h-5 w-5" />
            إضافة دواء آخر
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg rounded-xl"
          >
            {isSubmitting ? (
              "جاري الإرسال..."
            ) : (
              <>
                إرسال الأدوية للمريض
                <Send className="mr-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </main>

      <PharmacyBottomNav />
    </div>
  )
}
