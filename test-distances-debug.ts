// Test file to debug distance calculation
import { calculateHaversineDistance } from "./lib/utils"

// Test case: Default user location in Algeria vs pharmacy in Skikda
const userLat = 36.7538
const userLng = 3.0588

const pharmacyLat = 36.2868
const pharmacyLng = 7.9732

console.log("🧪 Testing Distance Calculation")
console.log("================================")
console.log(`User location: (${userLat}, ${userLng})`)
console.log(`Pharmacy location: (${pharmacyLat}, ${pharmacyLng})`)
console.log("")

// Test Haversine
const haversineDistance = calculateHaversineDistance(userLat, userLng, pharmacyLat, pharmacyLng)
console.log(`✓ Haversine distance: ${haversineDistance.toFixed(2)} km`)

// Apply correction factor
const correctedDistance = haversineDistance * 1.2
console.log(`✓ Corrected distance (×1.2): ${correctedDistance.toFixed(2)} km`)

// Expected: ~500 km
console.log(`✓ Expected range: 400-500 km`)
console.log(`✓ Is realistic: ${correctedDistance > 300 && correctedDistance < 600 ? "✅ YES" : "❌ NO"}`)
