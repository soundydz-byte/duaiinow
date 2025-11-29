"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { PrescriptionCard } from "@/components/home/prescription-card"
import { Upload, FileText, Sparkles } from 'lucide-react'
import { UploadCharacter } from "@/components/illustrations/upload-character"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Prescription {
  id: string
  images_urls: string[]
  notes?: string
  created_at: string
  status: string
  responses_count: number
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get user profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!profile) {
        router.push("/auth/login")
        return
      }

      // If pharmacy, redirect to pharmacy dashboard
      if (profile.role === "pharmacy") {
        router.push("/pharmacy/dashboard")
        return
      }

      // Get all prescriptions for the user
      const { data: prescriptionsData } = await supabase
        .from("prescriptions")
        .select(
          `
          *,
          responses:prescription_responses(count)
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      const prescriptionsWithCount =
        prescriptionsData?.map((p: any) => ({
          ...p,
          responses_count: Array.isArray(p.responses) ? p.responses.length : 0,
        })) || []

      setPrescriptions(prescriptionsWithCount)
      setIsLoading(false)
    }

    fetchData()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
        <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
              <FileText className="h-7 w-7" />
              جميع الوصفات
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
            </h1>
          </div>
        </header>
        <main className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-5">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
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
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <FileText className="h-7 w-7" />
            جميع الوصفات
            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          </h1>
          <p className="text-emerald-50 text-sm">جميع الوصفات الطبية المرفوعة</p>
        </div>
      </header>

      <main className="p-4">
        {prescriptions.length > 0 ? (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <Link key={prescription.id} href={`/prescriptions/${prescription.id}`}>
                <PrescriptionCard prescription={prescription} />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center border-2 border-dashed border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-sm">
            <UploadCharacter className="w-32 h-32 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-emerald-900">لا توجد وصفات بعد</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              ابدأ برفع وصفتك الطبية الأولى واحصل على أفضل الأسعار من الصيدليات القريبة
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 cute-button shadow-lg"
            >
              <Link href="/upload">
                <Upload className="ml-2 h-5 w-5" />
                رفع وصفة الآن
              </Link>
            </Button>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
