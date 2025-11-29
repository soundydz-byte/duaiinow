import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MapPin, Star, Clock, Phone, Sparkles } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function FavoritesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: favorites } = await supabase
    .from("pharmacy_favorites")
    .select(`
      *,
      pharmacy:pharmacy_profiles(
        *,
        profile:profiles(full_name, phone)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-rose-50/30 via-white to-white">
      <header className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
              <Heart className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                الصيدليات المفضلة
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-rose-50 text-sm">صيدلياتك المفضلة في مكان واحد</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {favorites && favorites.length > 0 ? (
          <div className="space-y-3">
            {favorites.map((fav: any) => {
              const pharmacy = fav.pharmacy
              if (!pharmacy) return null

              return (
                <Card
                  key={fav.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cute-card border-2 border-rose-100 rounded-2xl bg-gradient-to-br from-white to-rose-50/20"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-rose-900 mb-2">{pharmacy.pharmacy_name}</h3>

                        {pharmacy.address && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
                            <span>{pharmacy.address}</span>
                          </div>
                        )}

                        {pharmacy.profile?.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Phone className="h-4 w-4 text-rose-600" />
                            <span dir="ltr">{pharmacy.profile.phone}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 flex-wrap">
                          {pharmacy.is_verified && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                              <Star className="h-3.5 w-3.5" />
                              <span>معتمدة</span>
                            </div>
                          )}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 rounded-full text-xs font-semibold border border-rose-200">
                            <Heart className="h-3.5 w-3.5 fill-rose-600" />
                            <span>مفضلة</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-rose-100 to-rose-50 rounded-full shadow-md">
                        <Heart className="h-8 w-8 text-rose-600 fill-rose-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-rose-100">
                      <Button
                        asChild
                        variant="outline"
                        className="bg-gradient-to-br from-white to-rose-50 border-2 border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold rounded-lg"
                      >
                        <Link href={`/pharmacies/${pharmacy.id}`}>
                          <MapPin className="h-4 w-4 ml-2" />
                          عرض الموقع
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 font-semibold rounded-lg"
                      >
                        <Link href={`tel:${pharmacy.profile?.phone}`}>
                          <Phone className="h-4 w-4 ml-2" />
                          اتصال
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-12 text-center border-2 border-dashed border-rose-200 bg-gradient-to-br from-white to-rose-50/30 rounded-2xl shadow-sm">
            <Heart className="w-20 h-20 mx-auto mb-4 text-rose-300" />
            <h3 className="font-bold text-lg mb-2 text-rose-900">لا توجد صيدليات مفضلة بعد</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              ابدأ بإضافة صيدلياتك المفضلة لسهولة الوصول إليها
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 cute-button shadow-lg"
            >
              <Link href="/home">
                <MapPin className="ml-2 h-5 w-5" />
                استكشف الصيدليات
              </Link>
            </Button>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
