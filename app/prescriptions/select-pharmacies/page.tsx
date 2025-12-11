"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, ArrowRight, Building2, CheckCircle, Loader } from "lucide-react"
import { BottomNav } from "@/components/layout/bottom-nav"
import Link from "next/link"

interface Pharmacy {
  id: string
  name: string
  latitude: number
  longitude: number
  distance: number
  address?: string
  phone?: string
}

function SelectPharmaciesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prescriptionId = searchParams.get("prescriptionId")

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [selectedPharmacies, setSelectedPharmacies] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [minDistance, setMinDistance] = useState<number>(0) // الحد الأدنى للمسافة
  const [maxDistance, setMaxDistance] = useState<number>(30) // الحد الأقصى (يبدأ من 30 كم)
  const [autoExpandMessage, setAutoExpandMessage] = useState<string>("") // رسالة التوسيع التلقائي

  useEffect(() => {
    const fetchPharmacies = async () => {
      if (!prescriptionId) {
        router.push("/prescriptions")
        return
      }

      try {
        // Get user location
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              setUserLocation({ lat: latitude, lon: longitude })

              console.log(`📍 User location: (${latitude}, ${longitude})`)

              // Fetch nearby pharmacies with dynamic maxDistance (up to 200km)
              const response = await fetch("/api/prescriptions/nearby-pharmacies", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  prescriptionId,
                  userLatitude: latitude,
                  userLongitude: longitude,
                  maxDistance: 200, // احصل على جميع الصيدليات حتى 200 كم
                }),
              })

              if (response.ok) {
                const data = await response.json()
                setPharmacies(data.pharmacies)
                console.log(`✅ Found ${data.pharmacies.length} pharmacies within 200km`)
              } else {
                console.error("Failed to fetch pharmacies")
              }

              setIsLoading(false)
            },
            (error) => {
              console.error("Geolocation error:", error)
              setIsLoading(false)
            }
          )
        } else {
          console.warn("Geolocation not available")
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error fetching pharmacies:", error)
        setIsLoading(false)
      }
    }

    fetchPharmacies()
  }, [prescriptionId, router])

  const togglePharmacy = (pharmacyId: string) => {
    const newSelected = new Set(selectedPharmacies)
    if (newSelected.has(pharmacyId)) {
      newSelected.delete(pharmacyId)
    } else {
      newSelected.add(pharmacyId)
    }
    setSelectedPharmacies(newSelected)
  }

  const handleSendPrescription = async () => {
    if (selectedPharmacies.size === 0) {
      alert("الرجاء اختيار صيدلية واحدة على الأقل")
      return
    }

    setIsSending(true)
    try {
      const supabase = createClient()

      // Create prescription responses for each selected pharmacy
      const responses = Array.from(selectedPharmacies).map((pharmacyId) => ({
        prescription_id: prescriptionId,
        pharmacy_id: pharmacyId,
        status: "pending",
        created_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from("prescription_responses")
        .insert(responses)

      if (error) throw error

      alert("✅ تم إرسال الوصفة للصيدليات المختارة بنجاح")
      router.push("/prescriptions")
    } catch (error) {
      console.error("Error sending prescription:", error)
      alert("❌ حدث خطأ أثناء إرسال الوصفة")
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
        <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-7 w-7" />
              اختيار الصيدليات
            </h1>
            <p className="text-emerald-50 text-sm mt-1">جاري البحث عن الصيدليات القريبة...</p>
          </div>
        </header>
        <main className="p-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold">جاري تحديد موقعك...</p>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-7 w-7" />
              اختيار الصيدليات
            </h1>
            <Button asChild variant="ghost" className="text-white hover:bg-white/20">
              <Link href="/prescriptions">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <p className="text-emerald-50 text-sm">
            اختر الصيدليات التي تريد إرسال الوصفة إليها (ضمن المسافة المحددة)
          </p>
          {userLocation && (
            <p className="text-emerald-50 text-xs mt-2 opacity-75">
              📍 موقعك: {userLocation.lat.toFixed(2)}, {userLocation.lon.toFixed(2)}
            </p>
          )}
        </div>
      </header>

      <main className="p-4 space-y-3">
        {/* Distance filter - مثل Facebook Marketplace */}
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl">
          <p className="text-sm font-semibold text-emerald-900 mb-4">🎯 نطاق البحث عن الصيدليات:</p>
          <div className="space-y-4">
            {/* Min Distance Slider */}
            <div>
              <label className="text-xs text-emerald-700 font-semibold">الحد الأدنى:</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={maxDistance}
                  step="5"
                  value={minDistance}
                  onChange={(e) => {
                    const newMin = Number(e.target.value)
                    if (newMin <= maxDistance) setMinDistance(newMin)
                  }}
                  className="flex-1 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-sm font-bold text-emerald-700 bg-white px-2 py-1 rounded min-w-max">
                  {minDistance} كم
                </span>
              </div>
            </div>

            {/* Max Distance Slider */}
            <div>
              <label className="text-xs text-emerald-700 font-semibold">الحد الأقصى:</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={minDistance}
                  max="200"
                  step="10"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="flex-1 h-2 bg-emerald-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <span className="text-sm font-bold text-emerald-700 bg-white px-2 py-1 rounded min-w-max border-2 border-emerald-400">
                  {maxDistance} كم
                </span>
              </div>
            </div>

            {/* Range Display */}
            <div className="bg-white rounded-lg p-2 border-2 border-emerald-200">
              <p className="text-xs text-center text-emerald-600">
                🔍 البحث عن صيدليات بين <span className="font-bold">{minDistance}</span> و <span className="font-bold">{maxDistance}</span> كم
              </p>
            </div>

            {/* Auto-expand message */}
            {autoExpandMessage && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2">
                <p className="text-xs text-blue-700 font-semibold">
                  ℹ️ {autoExpandMessage}
                </p>
              </div>
            )}
          </div>
        </Card>

        {pharmacies.length === 0 ? (
          <Card className="p-8 text-center border-2 border-dashed border-emerald-200">
            <MapPin className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2 text-emerald-900">لا توجد صيدليات قريبة</h3>
            <p className="text-sm text-gray-600">للأسف لا توجد صيدليات مفعلة ضمن النطاق المحدد من موقعك</p>
          </Card>
        ) : (
          <>
            {/* Filtered pharmacies count with auto-expand logic */}
            {(() => {
              const filteredPharmacies = pharmacies.filter(p => p.distance >= minDistance && p.distance <= maxDistance)
              const hasPharmaciesInRange = filteredPharmacies.length > 0
              
              // إذا لم توجد صيدليات في النطاق المختار، اقترح التوسيع التلقائي
              if (!hasPharmaciesInRange && maxDistance < 200) {
                const nextDistance = Math.min(maxDistance + 30, 200)
                const pharmaciesInNextRange = pharmacies.filter(p => p.distance >= minDistance && p.distance <= nextDistance)
                if (pharmaciesInNextRange.length > 0) {
                  setAutoExpandMessage(`لا توجد صيدليات في النطاق ${minDistance}-${maxDistance} كم. وجدنا ${pharmaciesInNextRange.length} صيدلية في النطاق ${minDistance}-${nextDistance} كم!`)
                }
              } else {
                setAutoExpandMessage("")
              }

              return (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-sm text-blue-900">
                      ✅ وجدنا <span className="font-bold">{filteredPharmacies.length}</span> صيدليات في النطاق المختار
                    </p>
                  </div>

                  {filteredPharmacies.length > 0 ? (
                    <div className="space-y-2">
                      {filteredPharmacies.map((pharmacy) => (
                        <Card
                          key={pharmacy.id}
                          className="cursor-pointer hover:shadow-lg transition-all border-2"
                          onClick={() => togglePharmacy(pharmacy.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
                                selectedPharmacies.has(pharmacy.id)
                                  ? "bg-emerald-500 border-emerald-500"
                                  : "border-gray-300"
                              }`}>
                                {selectedPharmacies.has(pharmacy.id) && (
                                  <CheckCircle className="h-5 w-5 text-white" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900">{pharmacy.name}</h3>
                                <div className="space-y-1 mt-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                    <span className="truncate">{pharmacy.address || "عنوان غير متوفر"}</span>
                                  </div>
                                  {pharmacy.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Phone className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                      <span>{pharmacy.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex-shrink-0 text-right">
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold">
                                  {pharmacy.distance} كم
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-6 border-2 border-dashed border-yellow-300 bg-yellow-50">
                      <p className="text-sm text-yellow-800 text-center font-semibold">
                        📍 لا توجد صيدليات في النطاق {minDistance}-{maxDistance} كم
                      </p>
                      <p className="text-xs text-yellow-700 text-center mt-2">
                        حاول زيادة الحد الأقصى للمسافة
                      </p>
                    </Card>
                  )}
                </>
              )
            })()}

            <div className="fixed bottom-20 left-4 right-4">
              <Button
                onClick={handleSendPrescription}
                disabled={selectedPharmacies.size === 0 || isSending}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold h-12 rounded-xl shadow-lg"
              >
                {isSending ? (
                  <>
                    <Loader className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    إرسال الوصفة إلى {selectedPharmacies.size} صيدلية
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default function SelectPharmaciesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader className="h-12 w-12 animate-spin text-emerald-600" /></div>}>
      <SelectPharmaciesContent />
    </Suspense>
  )
}
