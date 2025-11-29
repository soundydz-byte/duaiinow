"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Heart, Navigation, Phone } from 'lucide-react'
import { toggleFavorite } from "@/app/actions/favorites"
import { useToast } from "@/hooks/use-toast"

interface PharmacyCardProps {
  pharmacy: {
    id: string
    pharmacy_name: string
    address: string
    latitude: number
    longitude: number
    is_verified: boolean
    phone?: string
  }
  isFavorited: boolean
  onNavigate?: () => void
}

export function PharmacyCardWithFavorite({ pharmacy, isFavorited: initialFavorited, onNavigate }: PharmacyCardProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    try {
      const result = await toggleFavorite(pharmacy.id)
      setIsFavorited(result.favorited)
      toast({
        title: result.favorited ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة",
        description: result.favorited 
          ? `تم إضافة ${pharmacy.pharmacy_name} للمفضلة` 
          : `تم إزالة ${pharmacy.pharmacy_name} من المفضلة`,
      })
    } catch (error) {
      console.error("Toggle favorite error:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحديث المفضلة",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cute-card border-2 border-emerald-100 rounded-2xl bg-gradient-to-br from-white to-emerald-50/20">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-emerald-900 mb-2">{pharmacy.pharmacy_name}</h3>

            {pharmacy.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>{pharmacy.address}</span>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {pharmacy.is_verified && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                  <Star className="h-3.5 w-3.5" />
                  <span>معتمدة</span>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`rounded-full transition-all ${
              isFavorited 
                ? "bg-rose-100 hover:bg-rose-200 text-rose-600" 
                : "hover:bg-emerald-100 text-emerald-600"
            }`}
          >
            <Heart className={`h-6 w-6 ${isFavorited ? "fill-rose-600" : ""}`} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-emerald-100">
          <Button
            onClick={onNavigate}
            variant="outline"
            className="bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-semibold rounded-lg"
          >
            <Navigation className="h-4 w-4 ml-2" />
            التوجيه
          </Button>
          {pharmacy.phone && (
            <Button
              asChild
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-semibold rounded-lg"
            >
              <a href={`tel:${pharmacy.phone}`}>
                <Phone className="h-4 w-4 ml-2" />
                اتصال
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
