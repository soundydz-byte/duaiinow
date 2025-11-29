"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Clock, MapPin, ArrowRight, Sparkles, Upload, Archive, RotateCcw } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import type { Prescription } from "@/lib/types"
import { formatCurrency } from "@/lib/utils/number-converter"

interface ArchivedPrescription {
  id: string
  original_id: string
  user_id: string
  data: any
  archived_at: string
  expires_at: string
  restored_at?: string
  restored_by?: string
}

export default function ArchivePage() {
  const [archivedPrescriptions, setArchivedPrescriptions] = useState<ArchivedPrescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchArchivedPrescriptions = async () => {
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

      // Get archived prescriptions for the user
      const { data: archivedData } = await supabase
        .from("archived_prescriptions")
        .select("*")
        .eq("user_id", user.id)
        .is("restored_at", null)
        .order("archived_at", { ascending: false })

      setArchivedPrescriptions(archivedData || [])
      setIsLoading(false)
    }

    fetchArchivedPrescriptions()
  }, [router])

  const handleRestore = async (archiveId: string) => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    try {
      // Call the restore function
      const { data, error } = await supabase.rpc('restore_archived_prescription', {
        archive_id: archiveId,
        restorer_id: user.id
      })

      if (error) throw error

      if (data) {
        // Remove from archived list
        setArchivedPrescriptions(prev => prev.filter(p => p.id !== archiveId))
        alert('تم استرجاع الوصفة بنجاح!')
      } else {
        alert('فشل في استرجاع الوصفة')
      }
    } catch (error) {
      console.error('Error restoring prescription:', error)
      alert('حدث خطأ أثناء استرجاع الوصفة')
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
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/home">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                  <Archive className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">الأرشيف</h1>
                  <p className="text-emerald-50 text-sm">الوصفات المؤرشفة</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 font-semibold">
                {archivedPrescriptions.length} وصفة مؤرشفة
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {archivedPrescriptions.length > 0 ? (
          <div className="space-y-4">
            {archivedPrescriptions.map((archived) => {
              const prescription = archived.data
              const daysUntilExpiry = Math.ceil(
                (new Date(archived.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              )

              return (
                <Card key={archived.id} className="p-4 border-2 border-amber-100 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 cute-card">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 rounded-2xl p-3 flex-shrink-0">
                      <Archive className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-emerald-900 truncate">
                          وصفة طبية مؤرشفة
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold text-xs">
                            {daysUntilExpiry > 0 ? `${daysUntilExpiry} يوم متبقي` : 'منتهي الصلاحية'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        مؤرشفة في: {new Date(archived.archived_at).toLocaleDateString("ar-DZ")}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        تنتهي في: {new Date(archived.expires_at).toLocaleDateString("ar-DZ")}
                      </p>
                      {prescription.notes && (
                        <p className="text-sm text-muted-foreground mt-2 truncate">
                          {prescription.notes}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-xs text-muted-foreground">
                          يمكنك استرجاع هذه الوصفة حتى تاريخ انتهاء الصلاحية
                        </div>
                        <Button
                          onClick={() => handleRestore(archived.id)}
                          disabled={daysUntilExpiry <= 0}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 cute-button shadow-lg"
                        >
                          <RotateCcw className="ml-2 h-4 w-4" />
                          استرجاع
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-10 text-center border-2 border-dashed border-amber-200 bg-gradient-to-br from-white to-amber-50/30 rounded-2xl shadow-sm">
            <Archive className="w-20 h-20 mx-auto mb-4 text-amber-300" />
            <h3 className="font-bold text-lg mb-2 text-emerald-900">لا توجد وصفات مؤرشفة</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              الوصفات المؤرشفة ستظهر هنا. الوصفات تُؤرشف تلقائياً بعد 60 دقيقة من عدم الرد عليها.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 cute-button shadow-lg"
            >
              <Link href="/home">
                <ArrowRight className="ml-2 h-5 w-5" />
                العودة للرئيسية
              </Link>
            </Button>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
