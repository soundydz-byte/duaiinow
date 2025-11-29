"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { RoleSelector } from "@/components/auth/role-selector"
import { UserPlus, Mail, Lock, User, Building2, MapPin, FileText, Phone, Sparkles } from 'lucide-react'

export default function SignupPage() {
  const [role, setRole] = useState<"user" | "pharmacy">("user")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")

  // Pharmacy specific fields
  const [pharmacyName, setPharmacyName] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [address, setAddress] = useState("")

  // Geolocation fields
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (role === "pharmacy" && !locationPermissionAsked && "geolocation" in navigator) {
      setLocationPermissionAsked(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
          toast({
            title: "تم تحديد الموقع",
            description: "تم الحصول على موقع الصيدلية بنجاح",
          })
        },
        (error) => {
          console.error("[v0] Geolocation error:", error)
          toast({
            title: "تنبيه",
            description: "لم نتمكن من الحصول على موقعك. يمكنك تعديله لاحقاً من الملف الشخصي.",
            variant: "destructive",
          })
        }
      )
    }
  }, [role, locationPermissionAsked, toast])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const metadata: Record<string, any> = {
        full_name: fullName,
        role: role,
        phone: phone,
      }

      if (role === "pharmacy") {
        metadata.pharmacy_name = pharmacyName
        metadata.license_number = licenseNumber
        metadata.address = address
        if (latitude && longitude) {
          metadata.latitude = latitude
          metadata.longitude = longitude
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/verify`,
          data: metadata,
        },
      })

      if (error) throw error

      if (data.user) {
        if (role === "pharmacy") {
          const { error: pharmacyError } = await supabase.from("pharmacy_profiles").insert({
            id: data.user.id,
            pharmacy_name: pharmacyName,
            license_number: licenseNumber,
            address: address,
            latitude: latitude,
            longitude: longitude,
          })

          if (pharmacyError) {
            console.error("[v0] Pharmacy profile creation error:", pharmacyError)
          }
        }

        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب",
        })

        router.push("/auth/verify")
      }
    } catch (error: unknown) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error instanceof Error ? error.message : "حدث خطأ ما",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl p-4 shadow-2xl cute-card">
            <img src="/images/logo.png" alt="دوائي" className="w-full h-full object-contain p-1" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            إنشاء حساب جديد
          </h1>
        </div>

        <Card className="shadow-2xl border-2 border-emerald-100 rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4 bg-gradient-to-br from-emerald-50 to-white">
            <CardTitle className="text-xl text-center font-bold text-emerald-900">انضم إلى دوائي</CardTitle>
            <CardDescription className="text-center">اختر نوع الحساب وأدخل بياناتك</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <RoleSelector selectedRole={role} onRoleChange={setRole} />

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold">
                  {role === "pharmacy" ? "اسم المسؤول" : "الاسم الكامل"}
                </Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-5 w-5 text-emerald-500" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={role === "pharmacy" ? "أحمد محمد" : "الاسم الكامل"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pr-11 h-11 border-2 border-emerald-100 focus:border-emerald-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              {role === "pharmacy" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyName" className="text-sm font-semibold">
                      اسم الصيدلية
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute right-3 top-3 h-5 w-5 text-emerald-500" />
                      <Input
                        id="pharmacyName"
                        type="text"
                        placeholder="صيدلية النور"
                        value={pharmacyName}
                        onChange={(e) => setPharmacyName(e.target.value)}
                        className="pr-11 h-11 border-2 border-emerald-100 focus:border-emerald-300 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-sm font-semibold">
                      رقم الترخيص
                    </Label>
                    <div className="relative">
                      <FileText className="absolute right-3 top-3 h-5 w-5 text-emerald-500" />
                      <Input
                        id="licenseNumber"
                        type="text"
                        placeholder="123456"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="pr-11 h-11 border-2 border-emerald-100 focus:border-emerald-300 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-semibold">
                      العنوان
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 h-5 w-5 text-emerald-500" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="شارع الملك فهد، الرياض"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pr-11 h-11 border-2 border-emerald-100 focus:border-emerald-300 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {latitude && longitude && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                      <p className="text-sm text-green-700 font-medium text-center">
                        ✓ تم تحديد موقع الصيدلية بنجاح
                      </p>
                      <p className="text-xs text-green-600 text-center mt-1">
                        يمكنك تعديل الموقع لاحقاً من الملف الشخصي
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">
                  رقم الجوال
                </Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-5 w-5 text-emerald-500" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pr-11 h-11 border-2 border-emerald-100 focus:border-emerald-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-5 w-5 text-emerald-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-11 h-11 border-2 border-emerald-100 focus:border-emerald-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-emerald-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-11 h-11 border-2 border-emerald-100 focus:border-emerald-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                  تأكيد كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-emerald-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-11 h-11 border-2 border-emerald-100 focus:border-emerald-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-bold shadow-lg cute-button rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  "جاري إنشاء الحساب..."
                ) : (
                  <>
                    <UserPlus className="ml-2 h-5 w-5" />
                    إنشاء حساب
                  </>
                )}
              </Button>

              <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
                <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-bold">
                  تسجيل الدخول
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
