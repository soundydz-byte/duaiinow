import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { HomeBottomNavWrapper } from './bottom-nav-wrapper'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PrescriptionCard } from "@/components/home/prescription-card"
import { PharmacyMap } from "@/components/home/pharmacy-map"
import { Upload, MapPin, Pill, TrendingUp, Sparkles } from 'lucide-react'
import { UploadCharacter } from "@/components/illustrations/upload-character"
import Link from "next/link"
import { fetchPharmaciesWithLocation } from "@/app/actions/pharmacies"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // If pharmacy, redirect to pharmacy dashboard
  if (profile.role === "pharmacy") {
    redirect("/pharmacy/dashboard")
  }

  // Using Algeria coordinates as default (36.7538, 3.0588)
  // NOTE: This is just for initial render. The real location will be fetched client-side
  // from the user's device via geolocation API in the PharmacyMap component
  const userLatitude = profile.latitude || 36.7538
  const userLongitude = profile.longitude || 3.0588
  
  // Get pharmacies without distances first - distances will be calculated client-side
  // with the user's real location
  const pharmacies = await fetchPharmaciesWithLocation(userLatitude, userLongitude)

  // Check for selected pharmacy from URL query (server-side)
  let selectedPharmacyFromUrl = null
  if (typeof window !== 'undefined') {
    // This will run on client side, but we need to handle it differently for server-side rendering
    // The map component will handle this via useEffect
  }

  // Get recent prescriptions (limit to reduce load)
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select(
      `
      *,
      responses:prescription_responses(count)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(2)

  const prescriptionsWithCount =
    prescriptions?.map((p) => ({
      ...p,
      responses_count: Array.isArray(p.responses) ? p.responses.length : 0,
    })) || []

  const { count: medicinesCount } = await supabase
    .from("user_medicines")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
                <img src="/images/logo.png" alt="دوائي" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">مرحباً، {profile.full_name}</h1>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-emerald-50 text-sm">كيف يمكننا مساعدتك اليوم؟</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-lg cute-card">
              <CardContent className="p-4 text-center">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{prescriptions?.length || 0}</p>
                <p className="text-xs text-emerald-50 font-medium">وصفة</p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-lg cute-card">
              <CardContent className="p-4 text-center">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{pharmacies.length}</p>
                <p className="text-xs text-emerald-50 font-medium">صيدلية قريبة</p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-lg cute-card">
              <CardContent className="p-4 text-center">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{medicinesCount || 0}</p>
                <p className="text-xs text-emerald-50 font-medium">دواء</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <section>
          <div className="grid grid-cols-2 gap-4">
            <Button
              asChild
              className="h-28 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 flex-col gap-2 shadow-lg cute-button border-0 rounded-2xl"
            >
              <Link href="/upload">
                <div className="bg-white/20 rounded-full p-2 mb-1">
                  <Upload className="h-7 w-7" />
                </div>
                <span className="font-semibold">رفع وصفة جديدة</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-28 flex-col gap-2 border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 hover:bg-emerald-50 cute-button rounded-2xl shadow-md"
            >
              <Link href="/medicines">
                <div className="bg-emerald-100 rounded-full p-2 mb-1">
                  <Pill className="h-7 w-7 text-emerald-600" />
                </div>
                <span className="font-semibold text-emerald-700">أدويتي</span>
              </Link>
            </Button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <div className="bg-emerald-100 rounded-full p-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              الصيدليات القريبة
            </h2>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-emerald-100">
            <PharmacyMap pharmacies={pharmacies} />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <div className="bg-emerald-100 rounded-full p-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              الوصفات الأخيرة
            </h2>
            {prescriptions && prescriptions.length > 0 && (
              <Link href="/prescriptions" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
                عرض الكل ←
              </Link>
            )}
          </div>

          {prescriptionsWithCount.length > 0 ? (
            <div className="space-y-3">
              {prescriptionsWithCount.map((prescription) => (
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
        </section>
      </main>

      <HomeBottomNavWrapper />
    </div>
  )
}
