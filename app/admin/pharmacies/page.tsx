"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, FileText, CheckCircle, X, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { useToast } from "@/hooks/use-toast"

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPharmacies()
  }, [])

  const fetchPharmacies = async () => {
    const response = await fetch("/api/admin/pharmacies", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      setPharmacies(data)
    }

    setLoading(false)
  }

  const approvePharmacy = async (pharmacyId: string) => {
    try {
      const response = await fetch("/api/admin/pharmacies/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pharmacyId }),
      })

      if (!response.ok) {
        throw new Error("Failed to approve pharmacy")
      }

      // Update local state
      setPharmacies(prev => prev.map(p =>
        p.id === pharmacyId ? { ...p, is_verified: true } : p
      ))

      toast({
        title: "تم التفعيل",
        description: "تم تفعيل الصيدلية وإنشاء اشتراك تجريبي لمدة 30 يوم",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تفعيل الصيدلية",
        variant: "destructive",
      })
    }
  }

  const rejectPharmacy = async (pharmacyId: string) => {
    try {
      const response = await fetch("/api/admin/pharmacies/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pharmacyId }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject pharmacy")
      }

      // Remove from local state
      setPharmacies(prev => prev.filter(p => p.id !== pharmacyId))

      toast({
        title: "تم الرفض",
        description: "تم حذف طلب الصيدلية",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في رفض الصيدلية",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminAuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white pb-6">
        <header className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  إدارة الصيدليات
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-purple-50 text-sm">مراجعة وتفعيل طلبات الصيدليات الجديدة</p>
              </div>
            </div>
            <Button asChild className="bg-white/20 hover:bg-white/30 text-white rounded-full">
              <Link href="/admin">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : pharmacies && pharmacies.length > 0 ? (
          <div className="space-y-4">
            {pharmacies.map((pharmacy: any) => (
              <Card
                key={pharmacy.id}
                className={`overflow-hidden border-2 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 cute-card ${
                  pharmacy.is_verified ? "border-emerald-100" : "border-yellow-100"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-purple-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                            pharmacy.is_verified
                              ? "bg-emerald-100 border-emerald-200"
                              : "bg-yellow-100 border-yellow-200"
                          }`}
                        >
                          <Building2
                            className={`h-7 w-7 ${pharmacy.is_verified ? "text-emerald-600" : "text-yellow-600"}`}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{pharmacy.pharmacy_name}</h3>
                          <Badge
                            className={`text-xs font-bold shadow-md ${
                              pharmacy.is_verified
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-yellow-100 text-yellow-800 border-yellow-300 animate-pulse"
                            }`}
                          >
                            {pharmacy.is_verified ? "✓ مفعلة" : "⏳ قيد المراجعة"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 ml-4">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">المسؤول:</span> {pharmacy.profile?.full_name || "غير محدد"}
                        </p>

                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-900 font-medium">{pharmacy.license_number}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-900">{pharmacy.address}</span>
                        </div>

                        <p className="text-xs text-muted-foreground mt-3 p-2 bg-purple-50/50 rounded-lg">
                          التسجيل: {new Date(pharmacy.created_at).toLocaleDateString("en-US")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!pharmacy.is_verified && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => approvePharmacy(pharmacy.id)}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold shadow-lg cute-button rounded-lg"
                      >
                        <CheckCircle className="ml-2 h-5 w-5" />
                        تفعيل الآن
                      </Button>
                      <Button
                        onClick={() => rejectPharmacy(pharmacy.id)}
                        variant="destructive"
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg cute-button rounded-lg"
                      >
                        <X className="ml-2 h-5 w-5" />
                        رفض
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-2 border-dashed border-purple-200 bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-sm">
            <Building2 className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-purple-900">لا توجد صيدليات</h3>
            <p className="text-sm text-muted-foreground">لم يتم تسجيل أي صيدليات بعد</p>
          </Card>
        )}
      </main>
      </div>
    </AdminAuthCheck>
  )
}
