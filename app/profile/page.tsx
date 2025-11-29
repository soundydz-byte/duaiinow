"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, LogOut, Settings, Sparkles, ChevronLeft, Archive } from 'lucide-react'
import Image from "next/image"
import type { Profile } from "@/lib/types"

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<{ full_name: string; phone: string }>({ full_name: "", phone: "" })
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setEmail(user.email || "")

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (data) {
        setProfile(data)
      }

      setIsLoading(false)
    }

    fetchProfile()
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const handleSaveProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editedProfile.full_name,
        phone: editedProfile.phone,
      })
      .eq("id", user.id)

    if (!error) {
      setProfile({ ...profile!, ...editedProfile })
      setIsEditing(false)
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

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-8 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center">
          <div className="relative w-24 h-24 mb-4 bg-white/20 backdrop-blur-sm rounded-full p-2 shadow-lg mx-auto border-4 border-white/30">
            <img src="/images/logo.png" alt="دوائي" className="w-full h-full object-contain p-1" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-1">{profile?.full_name || "مستخدم"}</h1>
          <p className="text-emerald-100 text-sm">{email}</p>
        </div>
      </header>

      <main className="p-4 space-y-5">
        <Card className="border-2 border-emerald-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-white pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 rounded-full p-2">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                المعلومات الشخصية
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile()
                  } else {
                    setEditedProfile({
                      full_name: profile?.full_name || "",
                      phone: profile?.phone || "",
                    })
                    setIsEditing(true)
                  }
                }}
                className="text-emerald-600 hover:bg-emerald-50"
              >
                {isEditing ? "حفظ" : "تعديل"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {isEditing ? (
              <>
                <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={editedProfile.full_name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                    className="w-full p-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">رقم الجوال</label>
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    className="w-full p-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-100/50 hover:shadow-md transition-shadow">
                  <div className="bg-emerald-100 rounded-full p-3">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">الاسم الكامل</p>
                    <p className="font-bold text-base">{profile?.full_name || "غير محدد"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-100/50 hover:shadow-md transition-shadow">
                  <div className="bg-emerald-100 rounded-full p-3">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-bold text-base">{email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-100/50 hover:shadow-md transition-shadow">
                  <div className="bg-emerald-100 rounded-full p-3">
                    <Phone className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">رقم الجوال</p>
                    <p className="font-bold text-base">{profile?.phone || "غير محدد"}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-white pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="bg-emerald-100 rounded-full p-2">
                <Settings className="h-5 w-5 text-emerald-600" />
              </div>
              الإعدادات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <Link href="/archive">
              <Button
                variant="outline"
                className="w-full justify-between bg-gradient-to-br from-white to-emerald-50/30 border-2 border-emerald-100 hover:bg-emerald-50 rounded-xl h-12 cute-button"
              >
                <span className="flex items-center gap-3">
                  <Archive className="h-5 w-5 text-emerald-600" />
                  الأرشيف
                </span>
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-between bg-gradient-to-br from-white to-emerald-50/30 border-2 border-emerald-100 hover:bg-emerald-50 rounded-xl h-12 cute-button"
            >
              <span className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-emerald-600" />
                تعديل الملف الشخصي
              </span>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        <Button
          onClick={handleSignOut}
          className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg cute-button rounded-xl"
        >
          <LogOut className="ml-2 h-5 w-5" />
          تسجيل الخروج
        </Button>
      </main>

      <BottomNav />
    </div>
  )
}
