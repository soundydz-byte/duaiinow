"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Star, Search, Filter, X } from "lucide-react"
import { PharmacyCharacter } from "@/components/illustrations/pharmacy-character"
import dynamic from "next/dynamic"

const InteractiveMap = dynamic(() => import("./interactive-map"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center rounded-2xl">
      <div className="text-center space-y-3">
        <PharmacyCharacter className="w-20 h-20 mx-auto animate-pulse" />
        <p className="text-sm font-semibold text-emerald-900">جاري تحميل الخريطة...</p>
      </div>
    </div>
  ),
})

interface Pharmacy {
  id: string
  name: string
  latitude: number
  longitude: number
  distance?: number
  rating: number
  status: "مفتوح" | "مغلق"
  phone?: string
  address?: string
  working_hours?: string
}

export function PharmacyMap({ pharmacies: initialPharmacies }: { pharmacies: Pharmacy[] }) {
  console.log("🔷 PharmacyMap received initialPharmacies:", initialPharmacies)
  console.log("📊 PharmacyMap data details:", initialPharmacies.map(p => ({
    name: p.name,
    latitude: p.latitude,
    longitude: p.longitude,
    status: p.status,
    distance: p.distance,
    coordinatesValid: isFinite(p.latitude) && isFinite(p.longitude)
  })))
  
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(initialPharmacies || [])
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>(pharmacies)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"الكل" | "مفتوح" | "مغلق">("الكل")
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance")
  const [isLoadingRealDistances, setIsLoadingRealDistances] = useState(false)
  const [minDistance, setMinDistance] = useState<number>(0) // الحد الأدنى (0 كم)
  const [maxDistance, setMaxDistance] = useState<number>(50) // الحد الأقصى (50 كم افتراضياً)

  // Fetch pharmacies with real user location when component mounts
  useEffect(() => {
    const fetchPharmaciesWithRealLocation = async () => {
      try {
        setIsLoadingRealDistances(true)
        
        // Get user's real location
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              console.log(`📍 Got user's real location: (${latitude}, ${longitude})`)

              // Call API to get pharmacies with real distances
              const response = await fetch("/api/pharmacies", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userLatitude: latitude,
                  userLongitude: longitude,
                }),
              })

              if (response.ok) {
                const pharmaciesWithRealDistances = await response.json()
                console.log("📊 Pharmacies with real distances:", pharmaciesWithRealDistances)
                setPharmacies(pharmaciesWithRealDistances)
              } else {
                console.warn("Failed to fetch pharmacies with real distances, using initial data")
              }
            },
            (error) => {
              console.warn("Geolocation error, using initial distances:", error)
            }
          )
        } else {
          console.warn("Geolocation not available, using initial distances")
        }
      } catch (error) {
        console.error("Error fetching pharmacies with real location:", error)
      } finally {
        setIsLoadingRealDistances(false)
      }
    }

    fetchPharmaciesWithRealLocation()
  }, [])

  // Check for selected pharmacy from sessionStorage (when coming from prescription details) or URL query
  useEffect(() => {
    const storedPharmacy = sessionStorage.getItem("selectedPharmacy")
    if (storedPharmacy) {
      try {
        const pharmacyData = JSON.parse(storedPharmacy)
        setSelectedPharmacy(pharmacyData)
        // Clear the stored data
        sessionStorage.removeItem("selectedPharmacy")
      } catch (error) {
        console.error("Error parsing stored pharmacy data:", error)
      }
    }

    // Also check URL query parameters for selected pharmacy
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const selectedPharmacyParam = urlParams.get('selectedPharmacy')
      if (selectedPharmacyParam) {
        try {
          const pharmacyData = JSON.parse(selectedPharmacyParam)
          setSelectedPharmacy(pharmacyData)
          // Store in sessionStorage for persistence
          sessionStorage.setItem("selectedPharmacy", JSON.stringify(pharmacyData))
          // Clean up URL
          const newUrl = window.location.pathname
          window.history.replaceState({}, '', newUrl)
        } catch (error) {
          console.error("Error parsing selected pharmacy from URL:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    let filtered = pharmacies

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) => p.name.includes(searchQuery) || p.address?.includes(searchQuery))
    }

    // Apply status filter
    if (filterStatus !== "الكل") {
      filtered = filtered.filter((p) => p.status === filterStatus)
    }

    // Apply distance filter
    filtered = filtered.filter((p) => {
      const dist = p.distance || 0
      return dist >= minDistance && dist <= maxDistance
    })

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "distance") {
        return (a.distance || 0) - (b.distance || 0)
      }
      return b.rating - a.rating
    })

    setFilteredPharmacies(filtered)
  }, [pharmacies, searchQuery, filterStatus, sortBy, minDistance, maxDistance])

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
          <Input
            placeholder="ابحث عن صيدلية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 pl-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-0 bg-white"
          />
        </div>

        {/* Filter and sort controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-2 border-emerald-200 hover:bg-emerald-50 rounded-lg gap-2"
          >
            <Filter className="h-4 w-4" />
            تصفية
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortBy(sortBy === "distance" ? "rating" : "distance")}
            className="text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            {sortBy === "distance" ? "حسب المسافة" : "حسب التقييم"}
          </Button>
          {(searchQuery || filterStatus !== "الكل" || minDistance !== 0 || maxDistance !== 50) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setFilterStatus("الكل")
                setMinDistance(0)
                setMaxDistance(50)
              }}
              className="text-red-600 hover:bg-red-50 rounded-lg gap-1"
            >
              <X className="h-4 w-4" />
              مسح
            </Button>
          )}
        </div>

        {/* Filter options */}
        {showFilters && (
          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl space-y-4">
            {/* Distance filter */}
            <div>
              <p className="text-sm font-semibold text-emerald-900 mb-3">🎯 نطاق البحث:</p>
              <div className="space-y-3">
                {/* Min Distance */}
                <div>
                  <label className="text-xs text-emerald-700 font-semibold">الحد الأدنى:</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max={Math.max(200, maxDistance)}
                      step="5"
                      value={minDistance}
                      onChange={(e) => {
                        const newMin = Number(e.target.value)
                        if (newMin <= maxDistance) setMinDistance(newMin)
                      }}
                      className="flex-1 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <span className="text-sm font-bold text-emerald-700 bg-white px-2 py-1 rounded min-w-max">
                      {minDistance} كم
                    </span>
                  </div>
                </div>

                {/* Max Distance */}
                <div>
                  <label className="text-xs text-emerald-700 font-semibold">الحد الأقصى:</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={minDistance}
                      max="200"
                      step="10"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      className="flex-1 h-2 bg-emerald-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="text-sm font-bold text-emerald-700 bg-white px-2 py-1 rounded min-w-max border-2 border-emerald-400">
                      {maxDistance} كم
                    </span>
                  </div>
                </div>

                {/* Range Display */}
                <div className="bg-white rounded-lg p-2 border-2 border-emerald-200">
                  <p className="text-xs text-center text-emerald-600">
                    🔍 البحث عن صيدليات بين <span className="font-bold">{minDistance}</span> و <span className="font-bold">{maxDistance}</span> كم
                  </p>
                </div>
              </div>
            </div>

            {/* Status filter */}
            <div>
              <p className="text-sm font-semibold text-emerald-900 mb-2">حالة الصيدلية:</p>
              <div className="flex gap-2">
                {(["الكل", "مفتوح", "مغلق"] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={`rounded-lg text-xs font-semibold ${
                      filterStatus === status
                        ? "bg-emerald-500 text-white"
                        : "bg-white border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      <InteractiveMap
        pharmacies={filteredPharmacies}
        selectedPharmacy={selectedPharmacy}
        onSelectPharmacy={setSelectedPharmacy}
      />

      {/* Results count */}
      <div className="text-sm text-muted-foreground font-medium px-2">
        {filteredPharmacies.length} من {pharmacies.length} صيدلية
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredPharmacies.length > 0 ? (
          filteredPharmacies.map((pharmacy) => (
            <Card
              key={pharmacy.id}
              onClick={() => setSelectedPharmacy(pharmacy)}
              className={`p-3 cursor-pointer transition-all rounded-xl border-2 ${
                selectedPharmacy?.id === pharmacy.id
                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg"
                  : "border-emerald-100/50 bg-gradient-to-r from-white to-emerald-50/30 hover:shadow-md hover:border-emerald-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-2 shadow-md mt-1">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-emerald-900 truncate">{pharmacy.name}</h4>
                    {pharmacy.address && <p className="text-xs text-muted-foreground truncate">{pharmacy.address}</p>}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {pharmacy.distance && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                          <Navigation className="h-3 w-3" />
                          {pharmacy.distance.toFixed(2)} كم
                        </span>
                      )}
                      <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {pharmacy.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    className={`font-semibold text-xs ${
                      pharmacy.status === "مفتوح"
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300"
                        : "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-300"
                    }`}
                  >
                    {pharmacy.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center bg-gradient-to-br from-white to-emerald-50/30 border-2 border-dashed border-emerald-200 rounded-xl">
            <MapPin className="h-10 w-10 text-emerald-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-emerald-900">لا توجد صيدليات</p>
            <p className="text-xs text-muted-foreground mt-1">جرب تغيير عوامل البحث والتصفية</p>
          </Card>
        )}
      </div>
    </div>
  )
}
