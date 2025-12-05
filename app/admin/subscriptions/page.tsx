"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from 'lucide-react'
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { formatCurrency } from "@/lib/utils/number-converter"

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscriptions = async () => {
    console.log("Starting to fetch subscriptions...")
    
    const response = await fetch("/api/admin/subscriptions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Error fetching subscriptions")
      setIsLoading(false)
      return
    }

    const subsData = await response.json()

    console.log("Subscriptions data:", subsData)

    if (!subsData || subsData.length === 0) {
      console.log("No pending subscriptions found")
      setSubscriptions([])
      setIsLoading(false)
      return
    }

    console.log("Final subscriptions with pharmacy:", subsData)
    setSubscriptions(subsData)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleApprove = async (subscriptionId: string, pharmacyId: string, planType: string) => {
    try {
      const response = await fetch("/api/admin/subscriptions/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId, pharmacyId, planType }),
      })

      if (!response.ok) {
        throw new Error("Failed to approve subscription")
      }

      // Remove from pending list
      setSubscriptions(subscriptions.filter((s) => s.id !== subscriptionId))

      alert("تم قبول الاشتراك بنجاح! الصيدلية الآن ستظهر على الخريطة للمرضى")
    } catch (error) {
      console.error("Error approving subscription:", error)
      alert("حدث خطأ أثناء الموافقة على الاشتراك")
    }
  }

  const handleReject = async (subscriptionId: string) => {
    try {
      const response = await fetch("/api/admin/subscriptions/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject subscription")
      }

      setSubscriptions(subscriptions.filter((s) => s.id !== subscriptionId))

      alert("تم رفض الاشتراك")
    } catch (error) {
      console.error("Error rejecting subscription:", error)
      alert("حدث خطأ أثناء رفض الاشتراك")
    }
  }

  return (
    <AdminAuthCheck>
      <div className="min-h-screen pb-20 bg-gradient-to-b from-purple-50/30 via-white to-white">
        <header className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl mb-6">
          <h1 className="text-2xl font-bold">إدارة الاشتراكات</h1>
          <p className="text-purple-50 text-sm mt-2">مراجعة واعتماد طلبات الاشتراك</p>
        </header>

        <main className="p-4 space-y-4">
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">جاري التحميل...</p>
            </Card>
          ) : subscriptions.length > 0 ? (
            subscriptions.map((sub) => (
              <Card key={sub.id} className="border-2 border-yellow-100 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between mb-4 pb-4 border-b">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {sub.pharmacy?.pharmacy_name || "صيدلية"}
                      </h3>
                      <p className="text-sm text-gray-600">{sub.pharmacy?.address || "لا يوجد عنوان"}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {sub.pharmacy?.license_number ? `رخصة: ${sub.pharmacy.license_number}` : ""}
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700">
                      {sub.plan_type === "monthly"
                        ? "شهري - " + formatCurrency(1500)
                        : "سنوي - " + formatCurrency(12000)}
                    </Badge>
                  </div>

                  {sub.receipt_url && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">وصل الدفع:</p>
                      <div className="relative w-full rounded-2xl overflow-hidden border-4 border-purple-200 bg-white shadow-lg">
                        <img
                          src={sub.receipt_url || "/placeholder.svg"}
                          alt="وصل الدفع"
                          className="w-full h-auto object-contain max-h-[500px]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(sub.id, sub.pharmacy_id, sub.plan_type)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg h-12 font-bold"
                    >
                      <CheckCircle className="h-5 w-5 ml-2" />
                      موافقة وتفعيل
                    </Button>
                    <Button 
                      onClick={() => handleReject(sub.id)} 
                      variant="destructive" 
                      className="flex-1 rounded-lg h-12 font-bold"
                    >
                      <XCircle className="h-5 w-5 ml-2" />
                      رفض
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center border-2 border-dashed border-gray-300">
              <p className="text-gray-600 font-medium">لا توجد طلبات اشتراك بانتظار الموافقة</p>
            </Card>
          )}
        </main>
      </div>
    </AdminAuthCheck>
  )
}
