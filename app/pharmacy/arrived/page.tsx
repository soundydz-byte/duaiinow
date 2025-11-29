"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { PharmacyBottomNav } from "@/components/layout/pharmacy-bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, CheckCircle, Phone, MessageSquare } from "lucide-react"

export default function ArrivedPage() {
  const [arrivals, setArrivals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchArrivals = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("type", "customer_arrived")
        .order("created_at", { ascending: false })

      if (data) setArrivals(data)
      setIsLoading(false)
    }

    fetchArrivals()
  }, [])

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            العملاء الوصولون
          </h1>
          <p className="text-blue-50 text-sm mt-2">المرضى الذين وصلوا للصيدلية</p>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">جاري التحميل...</p>
          </Card>
        ) : arrivals.length > 0 ? (
          arrivals.map((arrival) => (
            <Card
              key={arrival.id}
              className="border-2 border-green-100 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">مريض وصل</h3>
                      <p className="text-sm text-gray-600">{new Date(arrival.created_at).toLocaleString("ar-SA")}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border border-green-300">وصل</Badge>
                </div>

                {arrival.data?.message && (
                  <p className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-gray-700">
                    {arrival.data.message}
                  </p>
                )}

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10">
                    <Phone className="h-4 w-4 ml-2" />
                    اتصل
                  </Button>
                  <Button variant="outline" className="flex-1 border-blue-200 rounded-lg h-10 bg-transparent">
                    <MessageSquare className="h-4 w-4 ml-2" />
                    رسالة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center border-2 border-dashed border-gray-300">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">لا توجد عملاء وصلوا حالياً</p>
          </Card>
        )}
      </main>

      <PharmacyBottomNav />
    </div>
  )
}
