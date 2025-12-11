"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Clock, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { SearchFilter } from "@/components/admin/search-filter"
import { PrescriptionImage } from "./prescription-image"

interface Prescription {
  id: string
  user_id: string
  status: "pending" | "responded" | "accepted" | "rejected" | "completed"
  created_at: string
  notes?: string
  images_urls?: string[]
  has_responded?: boolean
}

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch("/api/admin/prescriptions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
        setFilteredPrescriptions(data)
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFilters(query, filters)
  }

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters)
    applyFilters(searchQuery, newFilters)
  }

  const applyFilters = (query: string, currentFilters: Record<string, string>) => {
    let result = prescriptions

    // Search filter
    if (query) {
      result = result.filter((p) => p.id.toLowerCase().includes(query.toLowerCase()))
    }

    // Status filter
    if (currentFilters.status) {
      result = result.filter((p) => p.status === currentFilters.status)
    }

    // Sort
    if (currentFilters.sort) {
      if (currentFilters.sort === "newest") {
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      } else if (currentFilters.sort === "oldest") {
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      }
    }

    setFilteredPrescriptions(result)
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    responded: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-gray-100 text-gray-800",
  }

  const statusLabels: Record<string, string> = {
    pending: "قيد الانتظار",
    responded: "تم الرد",
    accepted: "مقبولة",
    rejected: "مرفوضة",
    completed: "مكتملة",
  }

  if (loading) {
    return (
      <AdminAuthCheck>
        <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-purple-600 font-bold">جاري التحميل...</p>
          </div>
        </div>
      </AdminAuthCheck>
    )
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
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    إدارة الوصفات
                    <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                  </h1>
                  <p className="text-purple-50 text-sm">عرض وإدارة جميع الوصفات الطبية</p>
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

      <main className="p-6 space-y-6">
        {/* Search and Filter */}
        <SearchFilter
          placeholder="ابحث عن وصفة برقم ID..."
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          filterOptions={[
            {
              label: "حالة الوصفة",
              key: "status",
              options: [
                { label: "قيد الانتظار", value: "pending" },
                { label: "تم الرد", value: "responded" },
                { label: "مقبولة", value: "accepted" },
                { label: "مرفوضة", value: "rejected" },
                { label: "مكتملة", value: "completed" },
              ],
            },
          ]}
          sortOptions={[
            { label: "الأحدث أولاً", value: "newest" },
            { label: "الأقدم أولاً", value: "oldest" },
          ]}
          onSortChange={(sortBy) => {
            const newFilters = { ...filters, sort: sortBy }
            setFilters(newFilters)
            applyFilters(searchQuery, newFilters)
          }}
        />

        {filteredPrescriptions && filteredPrescriptions.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 font-medium">
              عدد النتائج: <span className="text-purple-600 font-bold">{filteredPrescriptions.length}</span>
            </div>
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="overflow-hidden border-2 border-purple-100 shadow-md hover:shadow-lg transition-all">
                <div className="flex gap-4 p-4">
                  <PrescriptionImage
                    src={prescription.images_urls?.[0] || "/placeholder.svg"}
                    alt="وصفة طبية"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">وصفة طبية</h3>
                        <p className="text-xs text-muted-foreground">ID: {prescription.id}</p>
                      </div>
                      <Badge className={statusColors[prescription.status]}>{statusLabels[prescription.status]}</Badge>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(prescription.created_at).toLocaleDateString("ar-SA")}</span>
                    </div>

                    {prescription.notes && (
                      <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded-lg">{prescription.notes}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-2 border-dashed border-purple-200 bg-gradient-to-br from-white to-purple-50/30 rounded-2xl">
            <FileText className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-purple-900">
              {prescriptions.length === 0 ? "لا توجد وصفات" : "لم يتم العثور على نتائج"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {prescriptions.length === 0
                ? "لم يتم رفع أي وصفات بعد"
                : "حاول تغيير معايير البحث أو الفلاتر"}
            </p>
          </Card>
        )}
      </main>
      </div>
    </AdminAuthCheck>
  )
}
