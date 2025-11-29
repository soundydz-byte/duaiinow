import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { PharmacyBottomNav } from "@/components/layout/pharmacy-bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, Sparkles } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default async function PharmacyPrescriptionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: pharmacyProfile } = await supabase
    .from("pharmacy_profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!pharmacyProfile) {
    redirect("/auth/login")
  }

  // Check if pharmacy is verified and has active subscription
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("status, end_date, start_date")
    .eq("pharmacy_id", user.id)
    .eq("status", "active")
    .gte("end_date", new Date().toISOString())

  console.log("Pharmacy profile:", pharmacyProfile)
  console.log("Subscriptions:", subscriptions)

  // Force update pharmacy verification status based on active subscription
  if (subscriptions && subscriptions.length > 0) {
    const { error: updateError } = await supabase
      .from("pharmacy_profiles")
      .update({ is_verified: true })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating pharmacy verification:", updateError)
    } else {
      console.log("Pharmacy verification updated to true")
      // Update the local pharmacyProfile to reflect the change
      pharmacyProfile.is_verified = true
    }
  }

  // Temporarily bypass subscription check for testing
  const isActive = true

  console.log("Is active:", isActive)
  console.log("Current date:", new Date().toISOString())
  console.log("Subscription end date:", subscriptions?.[0]?.end_date)

  // if (!isActive) {
  //   return (
  //     <div className="min-h-screen pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
  //       <header className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
  //         <div className="relative z-10">
  //           <h1 className="text-2xl font-bold">الوصفات الطبية</h1>
  //         </div>
  //       </header>
  //       <main className="p-4">
  //         <Card className="p-10 text-center border-2 border-yellow-200 bg-yellow-50 rounded-2xl">
  //           <FileText className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
  //           <h3 className="font-bold text-lg mb-2 text-yellow-900">اشتراك غير نشط</h3>
  //           <p className="text-sm text-yellow-700 mb-4">يجب تفعيل الاشتراك لاستقبال الوصفات الطبية</p>
  //           <Link href="/pharmacy/subscriptions">
  //             <Button className="bg-yellow-500 hover:bg-yellow-600">
  //               الذهاب للاشتراكات
  //             </Button>
  //           </Link>
  //         </Card>
  //       </main>
  //       <PharmacyBottomNav />
  //     </div>
  //   )
  // }

  // Use default coordinates if pharmacy location is not set
  const pharmacyLat = pharmacyProfile?.latitude || 36.7538 // Algiers fallback
  const pharmacyLng = pharmacyProfile?.longitude || 3.0588

  // Get prescriptions that have been responded to by this pharmacy (for sending medicines)
  const { data: respondedPrescriptions } = await supabase
    .from("prescription_responses")
    .select(`
      id,
      prescription_id,
      created_at,
      prescription:prescriptions(
        id,
        images_urls,
        notes,
        created_at,
        status,
        user_id
      )
    `)
    .eq("pharmacy_id", user.id)
    .order("created_at", { ascending: false })

  // Get nearby prescriptions that haven't been responded to yet
  const { data: nearbyPrescriptions } = await supabase.rpc('get_nearby_prescriptions', {
    pharmacy_lat: pharmacyLat,
    pharmacy_lng: pharmacyLng,
    max_distance: 50000 // 50km in meters
  })

  // Filter out prescriptions that have already been responded to by this pharmacy
  const respondedIds = respondedPrescriptions?.map((r: any) => r.prescription_id) || []
  const availablePrescriptions = nearbyPrescriptions?.filter((p: any) => !respondedIds.includes(p.id)) || []

  // Combine responded prescriptions (for sending medicines) and available prescriptions
  const prescriptions = [
    ...(respondedPrescriptions?.map((r: any) => ({
      ...r.prescription,
      has_responded: true,
      response_id: r.id
    })) || []),
    ...(availablePrescriptions?.map((p: any) => ({
      ...p,
      has_responded: false
    })) || [])
  ]

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
              <FileText className="h-7 w-7" />
            </div>
            جميع الوصفات
            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          </h1>
          <p className="text-blue-50 text-sm">اختر وصفة للرد عليها والحصول على المزيد من الطلبات</p>
        </div>
      </header>

      <main className="p-4">
        {prescriptions && prescriptions.length > 0 ? (
          <div className="space-y-4">
            {prescriptions?.map((prescription: any) => (
              <Link key={prescription.id} href={prescription.has_responded ? `/pharmacy/patients/${prescription.id}/send-medicine` : `/pharmacy/prescriptions/${prescription.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cute-card border-2 border-blue-100/50 rounded-2xl bg-gradient-to-br from-white to-blue-50/20">
                  <div className="flex gap-4 p-5">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200 shadow-md">
                    <Image
                        src={prescription.images_urls?.[0] || "/placeholder.svg"}
                        alt="وصفة طبية"
                        fill
                        className="object-cover"
                        unoptimized={true}
                        priority={false}
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <h3 className="font-bold text-base text-blue-900">
                            {prescription.has_responded ? "وصفة تم الرد عليها" : "وصفة طبية جديدة"}
                          </h3>
                          <div className="flex gap-2">
                            {prescription.has_responded && (
                              <Badge className="text-xs font-bold shadow-md bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-300">
                                تم الرد
                              </Badge>
                            )}
                            <Badge
                              className={`text-xs font-bold shadow-md ${
                                prescription.status === "pending"
                                  ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300"
                                  : prescription.status === "responded"
                                  ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300"
                                  : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300"
                              }`}
                            >
                              {prescription.status === "pending" ? "جديدة" :
                               prescription.status === "responded" ? "تم الرد" : "مكتملة"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 p-2 bg-blue-50/60 w-fit rounded-full">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          <span>{new Date(prescription.created_at).toLocaleDateString("en-US")}</span>
                        </div>

                        {prescription.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2 bg-gray-50 p-2 rounded-lg mb-2">
                            {prescription.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center border-2 border-dashed border-blue-200 bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-sm">
            <FileText className="h-16 w-16 text-blue-200 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2 text-blue-900">لا توجد وصفات</h3>
            <p className="text-sm text-muted-foreground">سيتم إشعارك عند وصول وصفات جديدة من المستخدمين</p>
          </Card>
        )}
      </main>

      <PharmacyBottomNav />
    </div>
  )
}
