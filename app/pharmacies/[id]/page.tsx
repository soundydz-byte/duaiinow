"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, Navigation, Phone, Clock, ArrowLeft, Heart, MessageCircle } from 'lucide-react'
import { PharmacyCardWithFavorite } from "@/components/home/pharmacy-card-with-favorite"
import { toggleFavorite } from "@/app/actions/favorites"
import { useToast } from "@/hooks/use-toast"

interface Pharmacy {
  id: string
  pharmacy_name: string
  address: string
  latitude: number
  longitude: number
  is_verified: boolean
  phone?: string
  working_hours?: string
  rating?: number
  description?: string
}

export default function PharmacyPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)

  useEffect(() => {
    const fetchPharmacy = async () => {
      const supabase = createClient()
      const pharmacyId = params.id as string

      // Get pharmacy details
      const { data: pharmacyData, error } = await supabase
        .from("pharmacies")
        .select("*")
        .eq("id", pharmacyId)
        .single()

      if (error || !pharmacyData) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على الصيدلية",
          variant: "destructive",
        })
        router.push("/home")
        return
      }

      setPharmacy(pharmacyData)

      // Check if pharmacy is favorited
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: favorite } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("pharmacy_id", pharmacyId)
          .single()

        setIsFavorited(!!favorite)
      }

      setIsLoading(false)
    }

    if (params.id) {
      fetchPharmacy()
    }
  }, [params.id, router, toast])

  const handleToggleFavorite = async () => {
    if (!pharmacy) return

    setIsFavoriteLoading(true)
    try {
      const result = await toggleFavorite(pharmacy.id)
      setIsFavorited(result.favorited)
      toast({
        title: result.favorited ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة",
        description: result.favorited
          ? `تم إضافة ${pharmacy.pharmacy_name} للمفضلة`
          : `تم إزالة ${pharmacy.pharmacy_name} من المفضلة`,
      })
    } catch (error) {
      console.error("Toggle favorite error:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحديث المفضلة",
        variant: "destructive",
      })
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const handleNavigate = () => {
    if (!pharmacy) return

    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`
    window.open(url, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
        <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-6 bg-white/20 rounded w-48 animate-pulse"></div>
          </div>
        </header>
        <main className="p-4">
          <div className="animate-pulse space-y-4">
            <Card className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </Card>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <MapPin className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-emerald-900 mb-2">لم يتم العثور على الصيدلية</h2>
          <p className="text-muted-foreground mb-4">الصيدلية المطلوبة غير موجودة</p>
          <Button onClick={() => router.push("/home")} className="bg-emerald-600 hover:bg-emerald-700">
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{pharmacy.pharmacy_name}</h1>
              <p className="text-emerald-50 text-sm">تفاصيل الصيدلية</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {pharmacy.is_verified && (
              <Badge className="bg-green-100 text-green-700 border-green-300">
                <Star className="h-3 w-3 mr-1" />
                معتمدة
              </Badge>
            )}
            {pharmacy.rating && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                <Star className="h-3 w-3 mr-1 fill-amber-400" />
                {pharmacy.rating}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Pharmacy Details Card */}
        <Card className="border-2 border-emerald-100 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <MapPin className="h-5 w-5" />
              معلومات الصيدلية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pharmacy.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900">العنوان</p>
                  <p className="text-muted-foreground">{pharmacy.address}</p>
                </div>
              </div>
            )}

            {pharmacy.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900">الهاتف</p>
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {pharmacy.phone}
                  </a>
                </div>
              </div>
            )}

            {pharmacy.working_hours && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900">ساعات العمل</p>
                  <p className="text-muted-foreground">{pharmacy.working_hours}</p>
                </div>
              </div>
            )}

            {pharmacy.description && (
              <div className="pt-4 border-t border-emerald-100">
                <p className="font-semibold text-emerald-900 mb-2">وصف الصيدلية</p>
                <p className="text-muted-foreground">{pharmacy.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleNavigate}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 h-12 text-white font-semibold rounded-xl shadow-lg"
          >
            <Navigation className="h-5 w-5 ml-2" />
            التوجيه
          </Button>

          <Button
            onClick={handleToggleFavorite}
            disabled={isFavoriteLoading}
            variant="outline"
            className={`h-12 font-semibold rounded-xl border-2 ${
              isFavorited
                ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <Heart className={`h-5 w-5 ml-2 ${isFavorited ? "fill-rose-600" : ""}`} />
            {isFavorited ? "مفضلة" : "إضافة للمفضلة"}
          </Button>
        </div>

        {/* Contact Section */}
        <Card className="border-2 border-emerald-100 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-emerald-900 mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              تواصل مع الصيدلية
            </h3>
            <p className="text-muted-foreground mb-4">
              يمكنك التواصل مع الصيدلية للاستفسار عن الأدوية أو طلب المساعدة
            </p>
            <div className="flex gap-3">
              {pharmacy.phone && (
                <Button
                  asChild
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <a href={`tel:${pharmacy.phone}`}>
                    <Phone className="h-4 w-4 ml-2" />
                    اتصال
                  </a>
                </Button>
              )}
              <Button
                onClick={handleNavigate}
                variant="outline"
                className="flex-1 border-2 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              >
                <Navigation className="h-4 w-4 ml-2" />
                زيارة
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
