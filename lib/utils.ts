import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the Earth in kilometers

  // Convert degrees to radians
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in kilometers

  if (!isFinite(distance) || distance < 0) {
    return 0
  }

  return distance
}

export async function fetchDrivingDistance(
  coords1: [number, number],
  coords2: [number, number]
): Promise<number | null> {
  const [lat1, lon1] = coords1
  const [lat2, lon2] = coords2

  // OSRM API endpoint - Use HTTPS version
  const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      console.warn(`    ⚠️ OSRM API status ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const distanceInMeters = data.routes[0].distance
      const distanceInKm = distanceInMeters / 1000
      return distanceInKm
    }

    console.warn(`    ⚠️ OSRM no routes: ${data.code}`)
    return null
  } catch (error) {
    console.warn(`    ⚠️ OSRM fetch error:`, (error as any)?.message)
    return null
  }
}
