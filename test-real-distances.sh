#!/bin/bash

# Test script for the Real Distance Calculation Fix
# اختبر حساب المسافات من موقع المستخدم الفعلي

echo "🧪 Real Distance Calculation Test"
echo "=================================="
echo ""

# Example user locations
ALGIERS="36.7538,3.0588"
CONSTANTINE="36.3654,6.6149"
SKIKDA="36.8769,7.5400"

echo "📍 Test Locations:"
echo "  - Algiers: $ALGIERS"
echo "  - Constantine: $CONSTANTINE"
echo "  - Skikda: $SKIKDA"
echo ""

echo "✅ Test Scenario 1: User in Algiers"
echo "  Expected: Distances calculated from Algiers"
echo ""

echo "✅ Test Scenario 2: User in Constantine"
echo "  Expected: Distances calculated from Constantine"
echo ""

echo "✅ Test Scenario 3: User in Skikda"
echo "  Expected: Distances calculated from Skikda"
echo ""

echo "🔍 To test in browser:"
echo "  1. Open: http://localhost:3000/home"
echo "  2. Allow Geolocation permission when prompted"
echo "  3. Check Console (F12) for logs like:"
echo "     📍 Got user's real location: (latitude, longitude)"
echo "     📊 Pharmacies with real distances: [...]"
echo "  4. Verify distances are calculated from your real location"
echo ""

echo "✨ The API endpoint will:"
echo "  1. Receive your real coordinates from the client"
echo "  2. Calculate distances using OSRM (routing engine)"
echo "  3. Fallback to Haversine formula if OSRM fails"
echo "  4. Apply 1.2x correction factor for realistic road distances"
echo "  5. Return sorted pharmacies by distance"
echo ""

echo "🎯 Success Indicators:"
echo "  ✓ Distances are different from previous (Algiers-based) values"
echo "  ✓ Distances are sorted by closest to farthest"
echo "  ✓ Distances match your actual location to nearby pharmacies"
echo ""
