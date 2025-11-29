"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, MapPin, Clock, Phone, ArrowRight, Sparkles, Heart } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import type { Prescription, PrescriptionResponse } from "@/lib/types"
import { formatCurrency } from "@/lib/utils/number-converter"

interface PrescriptionDetailClientProps {
  prescriptionId: string
}

export function PrescriptionDetailClient({ prescriptionId }: PrescriptionDetailClientProps) {
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [responses, setResponses] = useState<PrescriptionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Get prescription
      const { data: prescriptionData } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("id", prescriptionId)
        .single()

      if (prescriptionData) {
        setPrescription(prescriptionData)
      }

      // Get responses with pharmacy info
      const { data: responsesData } = await supabase
        .from("prescription_responses")
        .select(
          `
          *,
          pharmacy:pharmacy_profiles(*)
        `,
        )
        .eq("prescription_id", prescriptionId)

      if (responsesData) {
        setResponses(responsesData as any)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [prescriptionId])

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error("Location error:", error)
        },
      )
    }
  }, [])

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

  if (!prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">لم يتم العثور على الوصفة</p>
        </div>
      </div>
    )
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    responded: "bg-blue-100 text-blue-800 border-blue-300",
    accepted: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
    completed: "bg-gray-100 text-gray-800 border-gray-300",
  }

  const statusLabels = {
    pending: "قيد الانتظار",
    responded: "تم الرد",
    accepted: "مقبولة",
    rejected: "مرفوضة",
    completed: "مكتملة",
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
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
                <h1 className="text-2xl font-bold">تفاصيل الوصفة</h1>
                <p className="text-emerald-50 text-sm">
                  {new Date(prescription.created_at).toLocaleDateString("en-US")}
                </p>
              </div>
            </div>
            <Badge className={`${statusColors[prescription.status]} text-sm font-bold shadow-lg`}>
              {statusLabels[prescription.status]}
            </Badge>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="border-2 border-emerald-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-white pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="bg-emerald-100 rounded-full p-2">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              صورة الوصفة
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {prescription.images_urls && prescription.images_urls.length > 0 ? (
              <div className="space-y-4">
                <div className="relative w-full rounded-2xl overflow-hidden bg-white shadow-md border-4 border-emerald-200">
                  <img
                    src={prescription.images_urls[0] || "/placeholder.svg"}
                    alt="وصفة طبية"
                    className="w-full h-auto object-contain max-h-[600px]"
                  />
                </div>
              </div>
            ) : (
              <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-white shadow-md border-2 border-emerald-100">
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <FileText className="h-16 w-16 text-gray-300" />
                </div>
              </div>
            )}
            {prescription.notes && (
              <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-100">
                <p className="text-sm font-bold text-emerald-900 mb-2">ملاحظاتك:</p>
                <p className="text-sm text-muted-foreground">{prescription.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <div className="bg-emerald-100 rounded-full p-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              ردود الصيدليات
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 ml-2">{responses.length}</Badge>
            </h2>
          </div>

          {responses.length > 0 ? (
            <div className="space-y-4">
              {responses.map((response) => (
                <Card
                  key={response.id}
                  className="border-2 border-emerald-100 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cute-card"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-emerald-100">
                      <div>
                        <h3 className="font-bold text-lg text-emerald-900">{response.pharmacy?.pharmacy_name}</h3>
                        {response.pharmacy?.address && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                            {response.pharmacy.address}
                          </p>
                        )}
                      </div>
                      <div className="text-right bg-gradient-to-br from-emerald-100 to-emerald-50 px-4 py-2 rounded-2xl border-2 border-emerald-200">
                        <p className="text-xs text-muted-foreground font-medium mb-1">السعر الإجمالي</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(response.total_price)}</p>
                      </div>
                    </div>

                    {response.estimated_ready_time && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">وقت التجهيز: {response.estimated_ready_time}</span>
                      </div>
                    )}

                    {response.notes && (
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100 mb-4">
                        <p className="text-sm text-blue-900">{response.notes}</p>
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        الأدوية المتوفرة:
                      </p>
                      {Array.isArray(response.available_medicines) &&
                        response.available_medicines.map((medicine: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm p-3 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-100"
                          >
                            <span className="font-medium text-gray-900">{medicine.name}</span>
                            <span className="font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                              {formatCurrency(medicine.price)}
                            </span>
                          </div>
                        ))}
                    </div>

                    <Button
                      onClick={() => {
                        // Navigate to the map page with pharmacy details
                        const pharmacyData = {
                          id: response.pharmacy?.id || "",
                          name: response.pharmacy?.pharmacy_name || "",
                          latitude: response.pharmacy?.latitude || 0,
                          longitude: response.pharmacy?.longitude || 0,
                          rating: 4.5,
                          status: "مفتوح" as const,
                          is_verified: true,
                        }
                        // Store pharmacy data in sessionStorage to pass to map
                        sessionStorage.setItem("selectedPharmacy", JSON.stringify(pharmacyData))
                        router.push("/home")
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold shadow-lg cute-button rounded-xl h-12"
                    >
                      <MapPin className="ml-2 h-5 w-5" />
                      الذهاب إلى الصيدلية
                    </Button>

                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold shadow-lg cute-button rounded-xl h-12 mt-4">
                      <Phone className="ml-2 h-5 w-5" />
                      التواصل مع الصيدلية
                    </Button>

                    <Button
                      onClick={async () => {
                        try {
                          const { toggleFavorite } = await import("@/app/actions/favorites")
                          const result = await toggleFavorite(response.pharmacy?.id)
                          toast({
                            title: result.favorited ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة",
                            description: result.favorited
                              ? `تم إضافة ${response.pharmacy?.pharmacy_name} للمفضلة`
                              : `تم إزالة ${response.pharmacy?.pharmacy_name} من المفضلة`,
                          })
                        } catch (error) {
                          toast({
                            title: "خطأ",
                            description: "فشل في تحديث المفضلة",
                            variant: "destructive",
                          })
                        }
                      }}
                      className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold shadow-lg cute-button rounded-xl h-12 mt-2"
                    >
                      <Heart className="ml-2 h-5 w-5" />
                      إضافة للمفضلة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center border-2 border-dashed border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-sm">
              <MapPin className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2 text-emerald-900">لا توجد ردود بعد</h3>
              <p className="text-sm text-muted-foreground">سيتم إشعارك عندما ترد الصيدليات على وصفتك</p>
            </Card>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
