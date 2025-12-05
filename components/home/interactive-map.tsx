"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { createClient } from "@/lib/supabase/client"

interface Pharmacy {
  id: string
  name: string
  latitude: number
  longitude: number
  rating: number
  status: "مفتوح" | "مغلق"
  is_verified?: boolean
  distance?: number
}

interface InteractiveMapProps {
  pharmacies: Pharmacy[]
  selectedPharmacy: Pharmacy | null
  onSelectPharmacy: (pharmacy: Pharmacy) => void
  onNavigate?: (pharmacy: Pharmacy) => void
}

// Function to fetch route from OSRM
async function fetchRouteFromOSRM(start: [number, number], end: [number, number]): Promise<L.LatLngExpression[] | null> {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
    )

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      const coordinates = route.geometry.coordinates

      // Convert from [lng, lat] to [lat, lng] for Leaflet
      return coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as L.LatLngExpression)
    }

    return null
  } catch (error) {
    console.error("Error fetching route from OSRM:", error)
    return null
  }
}

export default function InteractiveMap({ pharmacies, selectedPharmacy, onSelectPharmacy, onNavigate }: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const userMarkerRef = useRef<L.CircleMarker | null>(null)
  const routeLayerRef = useRef<L.Polyline | null>(null)
  const [currentZoom, setCurrentZoom] = useState<number>(13)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(userCoords)
          console.log("User location:", userCoords)
        },
        (error) => {
          // Silently handle geolocation error and use fallback
          setUserLocation([36.7538, 3.0588]) // Algiers fallback
        },
      )
    } else {
      setUserLocation([36.7538, 3.0588])
    }
  }, [])

  useEffect(() => {
    if (!userLocation) return

    if (!mapRef.current && typeof window !== "undefined") {
      const mapContainer = document.getElementById("map")
      if (!mapContainer) return

      mapRef.current = L.map("map", {
        zoomControl: true,
        attributionControl: true,
      }).setView(userLocation, 13)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Add zoom event listener
      mapRef.current.on('zoomend', () => {
        const zoom = mapRef.current!.getZoom()
        setCurrentZoom(zoom)
      })

      userMarkerRef.current = L.circleMarker(userLocation, {
        radius: 12,
        fillColor: "#3b82f6",
        color: "#ffffff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      })
        .bindPopup("<div style='text-align: center; font-weight: bold;'>📍 موقعك الحالي</div>")
        .addTo(mapRef.current)
      
      console.log("✅ Map initialized at user location:", userLocation)
    }

    if (!mapRef.current) return

    // Clear existing pharmacy markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    const pharmaciesToShow = pharmacies

    console.log("🔷 InteractiveMap received pharmacies:", pharmaciesToShow.length, "pharmacies")
    console.log("📍 Pharmacy details:", pharmaciesToShow.map(p => ({ 
      name: p.name, 
      lat: p.latitude, 
      lng: p.longitude, 
      distance: p.distance,
      status: p.status,
      validCoords: isFinite(p.latitude) && isFinite(p.longitude)
    })))
    
    if (pharmaciesToShow.length === 0) {
      console.warn("⚠️ No pharmacies to show on map!")
    }

    pharmaciesToShow.forEach((pharmacy) => {
      // Validate coordinates before adding marker
      if (!isFinite(pharmacy.latitude) || !isFinite(pharmacy.longitude)) {
        console.error(`❌ Invalid coordinates for pharmacy: ${pharmacy.name}`, {
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude
        })
        return
      }

      const isSelected = selectedPharmacy?.id === pharmacy.id
      const isOpen = pharmacy.status === "مفتوح"

      // Calculate dynamic icon size based on zoom level
      // Base size at zoom 13, scale down for lower zoom, cap at reasonable max
      const baseSize = 35
      const zoomFactor = Math.max(0.3, Math.min(1.5, currentZoom / 13)) // Min 0.3, max 1.5
      const iconSize = Math.round(baseSize * zoomFactor)
      const fontSize = Math.round(26 * zoomFactor)
      const borderWidth = Math.max(2, Math.round(4 * zoomFactor))
      const padding = Math.max(4, Math.round(6 * zoomFactor))
      const labelFontSize = Math.max(10, Math.round(12 * zoomFactor))

      const icon = L.divIcon({
        html: `
          <div style="text-align: center; width: ${iconSize + 30}px;">
            <div style="
              width: ${iconSize}px;
              height: ${iconSize}px;
              background: ${isOpen ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"};
              border-radius: 50%;
              border: ${borderWidth}px solid white;
              box-shadow: 0 6px 20px rgba(0,0,0,0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto ${Math.round(8 * zoomFactor)}px auto;
              transition: all 0.3s;
              ${isSelected ? "transform: scale(1.3); box-shadow: 0 8px 28px rgba(16, 185, 129, 0.6);" : ""}
            ">
              <span style="font-size: ${fontSize}px;">💊</span>
            </div>
            <div style="
              background: white;
              padding: ${padding}px ${padding + 4}px;
              border-radius: 12px;
              font-size: ${labelFontSize}px;
              font-weight: bold;
              color: ${isOpen ? "#10b981" : "#ef4444"};
              white-space: nowrap;
              max-width: 120px;
              overflow: hidden;
              text-overflow: ellipsis;
              box-shadow: 0 4px 10px rgba(0,0,0,0.2);
              border: 2px solid ${isOpen ? "#10b981" : "#ef4444"};
            ">${pharmacy.name}</div>
          </div>
        `,
        className: "pharmacy-marker-cute",
        iconSize: [iconSize + 30, iconSize + 35],
        iconAnchor: [Math.round((iconSize + 30) / 2), iconSize + 10],
        popupAnchor: [0, -iconSize - 10],
      })

      const marker = L.marker([pharmacy.latitude, pharmacy.longitude], { icon })

      marker.bindPopup(`
        <div style="padding: 14px; text-align: center; min-width: 160px;">
          <div style="font-size: 32px; margin-bottom: 10px;">💊</div>
          <h3 style="margin: 0 0 10px 0; font-size: 17px; font-weight: bold; color: #1f2937;">${pharmacy.name}</h3>
          <p style="margin: 8px 0; font-size: 14px; color: #6b7280;">⭐ ${pharmacy.rating.toFixed(1)}</p>
          <p style="margin: 8px 0; font-size: 14px; font-weight: bold; color: ${isOpen ? "#10b981" : "#ef4444"};
             background: ${isOpen ? "#d1fae5" : "#fee2e2"}; padding: 6px 10px; border-radius: 8px;">
            ${pharmacy.status}
          </p>
          ${pharmacy.distance ? `<p style="margin: 8px 0; font-size: 14px; color: #374151; font-weight: bold;">
            📍 المسافة: ${pharmacy.distance.toFixed(2)} كم
          </p>` : ''}
        </div>
      `)

      marker.on("click", () => {
        onSelectPharmacy(pharmacy)

        if (userLocation) {
          if (routeLayerRef.current) {
            routeLayerRef.current.remove()
          }

          // Fetch route from OSRM
          fetchRouteFromOSRM(userLocation, [pharmacy.latitude, pharmacy.longitude])
            .then((routeCoordinates) => {
              if (routeCoordinates && routeCoordinates.length > 0) {
                routeLayerRef.current = L.polyline(routeCoordinates, {
                  color: "#10b981",
                  weight: 6,
                  opacity: 0.8,
                  lineCap: "round"
                }).addTo(mapRef.current!)

                console.log("OSRM route drawn from user to pharmacy")
              } else {
                // Fallback to straight line if OSRM fails
                console.warn("OSRM failed, using straight line")
                const latlngs: L.LatLngExpression[] = [
                  [userLocation[0], userLocation[1]],
                  [pharmacy.latitude, pharmacy.longitude]
                ]

                routeLayerRef.current = L.polyline(latlngs, {
                  color: "#10b981",
                  weight: 6,
                  opacity: 0.8,
                  dashArray: "15, 10",
                  lineCap: "round"
                }).addTo(mapRef.current!)

                mapRef.current!.fitBounds(routeLayerRef.current.getBounds(), {
                  padding: [70, 70],
                  maxZoom: 14
                })
              }
            })
            .catch((error) => {
              console.error("Error fetching route from OSRM:", error)
              // Fallback to straight line
              const latlngs: L.LatLngExpression[] = [
                [userLocation[0], userLocation[1]],
                [pharmacy.latitude, pharmacy.longitude]
              ]

              routeLayerRef.current = L.polyline(latlngs, {
                color: "#10b981",
                weight: 6,
                opacity: 0.8,
                dashArray: "15, 10",
                lineCap: "round"
              }).addTo(mapRef.current!)

              mapRef.current!.fitBounds(routeLayerRef.current.getBounds(), {
                padding: [70, 70],
                maxZoom: 14
              })
            })
        }

        marker.openPopup()
      })

      marker.addTo(mapRef.current!)
      markersRef.current.set(pharmacy.id, marker)
    })

    // User has complete freedom - no zoom changes, no map movement
    // Only draw the route when pharmacy is selected
    console.log("📍 Pharmacy markers added. Map is completely free for user.")

    if (selectedPharmacy && mapRef.current) {
      if (routeLayerRef.current) {
        routeLayerRef.current.remove()
      }

      // Only draw route, don't move or zoom the map
      fetchRouteFromOSRM(userLocation, [selectedPharmacy.latitude, selectedPharmacy.longitude])
        .then((routeCoordinates) => {
          if (routeCoordinates && routeCoordinates.length > 0) {
            routeLayerRef.current = L.polyline(routeCoordinates, {
              color: "#10b981",
              weight: 6,
              opacity: 0.8,
              lineCap: "round"
            }).addTo(mapRef.current!)

            console.log("✅ Route drawn from user to pharmacy")
          } else {
            // Fallback to straight line if OSRM fails
            console.warn("⚠️ OSRM failed, using straight line")
            const latlngs: L.LatLngExpression[] = [
              [userLocation[0], userLocation[1]],
              [selectedPharmacy.latitude, selectedPharmacy.longitude]
            ]

            routeLayerRef.current = L.polyline(latlngs, {
              color: "#10b981",
              weight: 6,
              opacity: 0.8,
              dashArray: "15, 10",
              lineCap: "round"
            }).addTo(mapRef.current!)
          }
        })
        .catch((error) => {
          console.error("Error fetching route:", error)
          // Fallback to straight line
          const latlngs: L.LatLngExpression[] = [
            [userLocation[0], userLocation[1]],
            [selectedPharmacy.latitude, selectedPharmacy.longitude]
          ]

          routeLayerRef.current = L.polyline(latlngs, {
            color: "#10b981",
            weight: 6,
            opacity: 0.8,
            dashArray: "15, 10",
            lineCap: "round"
          }).addTo(mapRef.current!)
        })
    }
  }, [pharmacies, selectedPharmacy, onSelectPharmacy, onNavigate, userLocation, currentZoom])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return <div id="map" className="w-full h-96 rounded-2xl border-2 border-emerald-100 shadow-lg overflow-hidden" />
}
