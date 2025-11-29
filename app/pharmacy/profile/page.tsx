"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { PharmacyBottomNav } from "@/components/layout/pharmacy-bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, FileText, Phone, Mail, LogOut, Sparkles, Edit2 } from 'lucide-react'
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function PharmacyProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [pharmacyProfile, setPharmacyProfile] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({
    pharmacy_name: "",
    license_number: "",
    address: "",
    phone: "",
    google_maps_url: "",
  })
  const [hasLocation, setHasLocation] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setEmail(user.email || "")

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      const { data: pharmacyData } = await supabase.from("pharmacy_profiles").select("*").eq("id", user.id).single()

      if (profileData) setProfile(profileData)
      if (pharmacyData) {
        setPharmacyProfile(pharmacyData)
        setEditedData({
          pharmacy_name: pharmacyData.pharmacy_name || "",
          license_number: pharmacyData.license_number || "",
          address: pharmacyData.address || "",
          phone: profileData.phone || "",
          google_maps_url: pharmacyData.google_maps_url || "",
        })
        setHasLocation(!!(pharmacyData.latitude && pharmacyData.longitude))
      }

      setIsLoading(false)
    }

    fetchData()
  }, [router])

  const requestLocation = async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          
          if (!user) return

          const { error } = await supabase
            .from("pharmacy_profiles")
            .update({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
            .eq("id", user.id)

          if (!error) {
            setHasLocation(true)
            toast({
              title: "تم تحديد الموقع بنجاح",
              description: "سيظهر موقع صيدليتك على الخريطة للمرضى",
            })
          }
        },
        (error) => {
          toast({
            title: "خطأ",
            description: "لم نتمكن من الوصول إلى موقعك. تأكد من السماح بالوصول للموقع",
            variant: "destructive",
          })
        }
      )
    }
  }

  const handleSave = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    await supabase
      .from("pharmacy_profiles")
      .update({
        pharmacy_name: editedData.pharmacy_name,
        license_number: editedData.license_number,
        address: editedData.address,
        google_maps_url: editedData.google_maps_url,
      })
      .eq("id", user.id)

    await supabase
      .from("profiles")
      .update({ phone: editedData.phone })
      .eq("id", user.id)

    setPharmacyProfile({ ...pharmacyProfile, ...editedData })
    setProfile({ ...profile, phone: editedData.phone })
    setIsEditing(false)
    
    toast({
      title: "تم الحفظ",
      description: "تم تحديث معلومات الصيدلية بنجاح",
    })
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-8 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center">
          <div className="relative w-24 h-24 mb-4 bg-white/20 backdrop-blur-sm rounded-full p-2 shadow-lg mx-auto border-4 border-white/30">
            <img src="/images/logo.png" alt="دوائي" className="w-full h-full object-contain p-1" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-1">{pharmacyProfile?.pharmacy_name || "صيدلية"}</h1>
          <p className="text-blue-100 text-sm">{profile.full_name}</p>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="border-2 border-blue-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-white pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 rounded-full p-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                معلومات الصيدلية
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSave()
                  } else {
                    setIsEditing(true)
                  }
                }}
                className="text-blue-600 hover:bg-blue-50"
              >
                <Edit2 className="h-4 w-4 ml-1" />
                {isEditing ? "حفظ" : "تعديل"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {isEditing ? (
              <>
                <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">اسم الصيدلية</label>
                  <input
                    type="text"
                    value={editedData.pharmacy_name}
                    onChange={(e) => setEditedData({ ...editedData, pharmacy_name: e.target.value })}
                    className="w-full p-2 border-2 border-blue-200 rounded-lg"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">رقم الترخيص</label>
                  <input
                    type="text"
                    value={editedData.license_number}
                    onChange={(e) => setEditedData({ ...editedData, license_number: e.target.value })}
                    className="w-full p-2 border-2 border-blue-200 rounded-lg"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">العنوان</label>
                  <input
                    type="text"
                    value={editedData.address}
                    onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                    className="w-full p-2 border-2 border-blue-200 rounded-lg"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">رقم الجوال</label>
                  <input
                    type="tel"
                    value={editedData.phone}
                    onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                    className="w-full p-2 border-2 border-blue-200 rounded-lg"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">رابط Google Maps</label>
                  <input
                    type="url"
                    value={editedData.google_maps_url}
                    onChange={(e) => setEditedData({ ...editedData, google_maps_url: e.target.value })}
                    className="w-full p-2 border-2 border-blue-200 rounded-lg"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100/50 hover:shadow-md transition-shadow">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">اسم الصيدلية</p>
                    <p className="font-bold text-base text-gray-900">{pharmacyProfile?.pharmacy_name || "غير محدد"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100/50 hover:shadow-md transition-shadow">
                  <div className="bg-blue-100 rounded-full p-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">رقم الترخيص</p>
                    <p className="font-bold text-base text-gray-900">{pharmacyProfile?.license_number || "غير محدد"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100/50 hover:shadow-md transition-shadow">
                  <div className="bg-blue-100 rounded-full p-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">العنوان</p>
                    <p className="font-bold text-base text-gray-900">{pharmacyProfile?.address || "غير محدد"}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-white pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="bg-blue-100 rounded-full p-2">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              معلومات الاتصال
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100/50 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full p-3">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-bold text-base text-gray-900 break-all">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100/50 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full p-3">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">رقم الجوال</p>
                <p className="font-bold text-base text-gray-900">{profile?.phone || "غير محدد"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-white pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="bg-blue-100 rounded-full p-2">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              موقع الصيدلية على الخريطة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {hasLocation ? (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <p className="text-green-800 font-medium mb-2">✓ تم تحديد الموقع</p>
                <p className="text-sm text-green-700">
                  سيظهر موقع صيدليتك على الخريطة للمرضى القريبين منك بعد قبول اشتراكك
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <p className="text-yellow-800 font-medium mb-2">⚠ لم يتم تحديد الموقع</p>
                <p className="text-sm text-yellow-700 mb-3">
                  حدد موقعك ليتمكن المرضى من العثور على صيدليتك على الخريطة
                </p>
              </div>
            )}
            <Button
              onClick={requestLocation}
              variant="outline"
              className="w-full"
            >
              <MapPin className="h-4 w-4 ml-2" />
              {hasLocation ? "تحديث الموقع" : "تحديد الموقع الآن"}
            </Button>
          </CardContent>
        </Card>

        <form action="/auth/signout" method="post">
          <Button
            variant="destructive"
            className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg cute-button rounded-xl"
            type="submit"
            onClick={handleSignOut}
          >
            <LogOut className="ml-2 h-5 w-5" />
            تسجيل الخروج
          </Button>
        </form>
      </main>

      <PharmacyBottomNav />
    </div>
  )
}
