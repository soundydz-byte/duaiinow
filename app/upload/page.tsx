"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, Camera, ImageIcon, ArrowRight, X, Sparkles } from 'lucide-react'
import { UploadCharacter } from "@/components/illustrations/upload-character"
import Image from "next/image"

export default function UploadPage() {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const validFiles: File[] = []
      const validPreviews: string[] = []

      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "خطأ",
            description: `حجم الصورة ${file.name} يجب أن يكون أقل من 5 ميجابايت`,
            variant: "destructive",
          })
          continue
        }
        validFiles.push(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          validPreviews.push(reader.result as string)
          if (validPreviews.length === validFiles.length) {
            setPreviewUrls(prev => [...prev, ...validPreviews])
          }
        }
        reader.readAsDataURL(file)
      }

      setSelectedImages(prev => [...prev, ...validFiles])
    }
  }

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار صور الوصفة",
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
      if (!user) throw new Error("يجب تسجيل الدخول أولاً")

      let userLatitude = 36.7538 // Algiers fallback
      let userLongitude = 3.0588

      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
          })
          userLatitude = position.coords.latitude
          userLongitude = position.coords.longitude
        } catch (error) {
          console.error("Geolocation error:", error)
        }
      }

      // Upload all images to Supabase storage
      const uploadedUrls: string[] = []
      for (const image of selectedImages) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('prescriptions')
          .upload(fileName, image)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('prescriptions')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      // Create prescription record with image URLs array
      const { data: prescriptionData, error: insertError } = await supabase
        .from("prescriptions")
        .insert({
          user_id: user.id,
          images_urls: uploadedUrls, // Store array of URLs
          notes: notes || null,
          status: "pending",
          user_latitude: userLatitude,
          user_longitude: userLongitude,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const { data: pharmaciesData } = await supabase
        .from("pharmacy_profiles")
        .select("id, latitude, longitude")
        .eq("is_verified", true)

      if (pharmaciesData) {
        // Calculate distance and filter nearby pharmacies (< 50km)
        const nearbyPharmacies = pharmaciesData.filter((pharmacy) => {
          if (!pharmacy.latitude || !pharmacy.longitude) return false

          const R = 6371 // Earth's radius in km
          const dLat = ((Number(pharmacy.latitude) - userLatitude) * Math.PI) / 180
          const dLon = ((Number(pharmacy.longitude) - userLongitude) * Math.PI) / 180
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLatitude * Math.PI) / 180) *
              Math.cos((Number(pharmacy.latitude) * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          const distance = R * c

          return distance < 50
        })

        console.log("Found nearby pharmacies:", nearbyPharmacies.length)

        // Send notifications to nearby pharmacies
        const notifications = nearbyPharmacies.map((pharmacy) => ({
          user_id: pharmacy.id,
          title: "وصفة طبية جديدة",
          message: "وصلتك وصفة طبية جديدة من مريض قريب",
          type: "new_prescription",
          data: { prescription_id: prescriptionData.id },
        }))

        if (notifications.length > 0) {
          await supabase.from("notifications").insert(notifications)
        }
      }

      toast({
        title: "تم رفع الوصفة بنجاح",
        description: "سيتم إشعارك عندما ترد الصيدليات القريبة",
      })

      router.push("/home")
      router.refresh()
    } catch (error: unknown) {
      console.error("Upload error:", error)
      console.error("Error type:", typeof error)
      console.error("Error constructor:", error?.constructor?.name)

      let errorMessage = "حدث خطأ ما"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase errors
        if ('message' in error) {
          errorMessage = (error as any).message
        } else if ('error' in error && typeof (error as any).error === 'string') {
          errorMessage = (error as any).error
        } else {
          errorMessage = JSON.stringify(error)
        }
      }

      console.error("Final error message:", errorMessage)
      toast({
        title: "خطأ في رفع الوصفة",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <Upload className="h-7 w-7" />
            </div>
            رفع وصفة طبية
            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          </h1>
          <p className="text-emerald-50 text-sm mt-2">ارفع صورة وصفتك وانتظر ردود الصيدليات القريبة</p>
        </div>
      </header>

      <main className="p-4 space-y-5">
        <Card className="border-2 border-emerald-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-white">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-emerald-600" />
              صور الوصفة
            </CardTitle>
            <CardDescription>التقط صور واضحة للوصفة الطبية أو اختر من المعرض</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {previewUrls.length === 0 ? (
              <div className="space-y-4">
                <label htmlFor="image-upload" className="block">
                  <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-10 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all bg-gradient-to-br from-white to-emerald-50/30 cute-card">
                    <UploadCharacter className="w-28 h-28 mx-auto mb-4" />
                    <p className="text-base font-semibold mb-2 text-emerald-900">اضغط لاختيار صور</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG حتى 5MB لكل صورة</p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-14 bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-200 hover:bg-emerald-50 cute-button rounded-xl"
                    asChild
                  >
                    <label htmlFor="camera-upload" className="cursor-pointer">
                      <Camera className="ml-2 h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">التقاط صورة</span>
                      <input
                        id="camera-upload"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-200 hover:bg-emerald-50 cute-button rounded-xl"
                    asChild
                  >
                    <label htmlFor="gallery-upload" className="cursor-pointer">
                      <ImageIcon className="ml-2 h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">من المعرض</span>
                      <input
                        id="gallery-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative rounded-2xl overflow-hidden border-4 border-emerald-500 shadow-xl">
                      <Image
                        src={url}
                        alt={`معاينة الوصفة ${index + 1}`}
                        width={200}
                        height={150}
                        className="w-full h-auto"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 left-2 rounded-full shadow-lg cute-button"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 text-center">
                  <p className="text-sm text-emerald-700 font-semibold flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    تم اختيار {previewUrls.length} صورة بنجاح
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-white">
            <CardTitle>ملاحظات إضافية</CardTitle>
            <CardDescription>أضف أي ملاحظات أو تفاصيل إضافية (اختياري)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Label htmlFor="notes" className="sr-only">
              الملاحظات
            </Label>
            <Textarea
              id="notes"
              placeholder="مثال: أحتاج الأدوية بشكل عاجل، أو لدي حساسية من دواء معين..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none border-2 border-emerald-100 focus:border-emerald-300 rounded-xl"
            />
          </CardContent>
        </Card>

        <Button
          onClick={handleUpload}
          disabled={selectedImages.length === 0 || isUploading}
          className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-base font-bold shadow-xl cute-button rounded-xl"
        >
          {isUploading ? (
            "جاري الرفع..."
          ) : (
            <>
              رفع الوصفة
              <ArrowRight className="mr-2 h-5 w-5" />
            </>
          )}
        </Button>
      </main>

      <BottomNav />
    </div>
  )
}
