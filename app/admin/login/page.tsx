"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Sparkles } from 'lucide-react'
import Image from "next/image"
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const ADMIN_PASSWORD = "duaiiforwin"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("admin_authenticated", "true")
        localStorage.setItem("admin_session", "active")
        localStorage.setItem("admin_login_time", new Date().getTime().toString())

        router.push("/admin")
        router.refresh()
      } else {
        setError("كلمة السر غير صحيحة")
        setPassword("")
      }
    } catch (err) {
      setError("حدث خطأ ما")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <Card className="w-full max-w-md relative z-10 border-2 border-emerald-200 shadow-2xl rounded-3xl">
        <CardHeader className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-8 rounded-t-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                <img src="/images/logo.png" alt="دوائي" className="w-full h-full object-contain" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              لوحة الإدارة
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
            </CardTitle>
            <CardDescription className="text-emerald-100 text-sm mt-2">تسجيل دخول آمن للمسؤولين</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Password Input */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-emerald-900">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  كلمة السر
                </div>
              </label>
              <Input
                type="password"
                placeholder="أدخل كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-emerald-50 border-2 border-emerald-200 focus:border-emerald-500 rounded-xl h-12 px-4 text-right placeholder:text-emerald-300"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-right">
                <p className="text-sm font-bold text-red-600">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold h-12 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              {loading ? "جاري التحقق..." : "دخول"}
            </Button>

            {/* Info Box */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-700 font-medium">🔐 هذه الصفحة محمية للمسؤولين فقط</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
