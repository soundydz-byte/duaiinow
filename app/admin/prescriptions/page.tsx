import { createClient as createAdminClient } from "@supabase/supabase-js"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Clock } from "lucide-react"
import Link from "next/link"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { PrescriptionImage } from "./prescription-image"

export default async function AdminPrescriptionsPage() {
  // Use SERVICE ROLE key to bypass RLS policies
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all prescriptions
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("*")
    .order("created_at", { ascending: false })

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    responded: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-gray-100 text-gray-800",
  }

  const statusLabels = {
    pending: "قيد الانتظار",
    responded: "تم الرد",
    accepted: "مقبولة",
    rejected: "مرفوضة",
    completed: "مكتملة",
  }

  return (
    <AdminAuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-background pb-6">
      <header className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-7 w-7" />
              إدارة الوصفات
            </h1>
            <p className="text-purple-100 text-sm mt-1">عرض جميع الوصفات الطبية</p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/admin">رجوع</Link>
          </Button>
        </div>
      </header>

      <main className="p-4">
        {prescriptions && prescriptions.length > 0 ? (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="overflow-hidden border-2">
                <div className="flex gap-3 p-4">
                  <PrescriptionImage
                    src={prescription.images_urls?.[0] || "/placeholder.svg"}
                    alt="وصفة طبية"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold">وصفة طبية</h3>
                      <Badge className={statusColors[prescription.status as keyof typeof statusColors]}>{statusLabels[prescription.status as keyof typeof statusLabels]}</Badge>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(prescription.created_at).toLocaleDateString("en-US")}</span>
                    </div>

                    {prescription.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{prescription.notes}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-2">لا توجد وصفات</h3>
            <p className="text-sm text-muted-foreground">لم يتم رفع أي وصفات بعد</p>
          </Card>
        )}
      </main>
      </div>
    </AdminAuthCheck>
  )
}
