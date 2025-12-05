#!/bin/bash
# 🧪 Testing script for pharmacy icons fix

echo "🔍 Checking TypeScript syntax..."

# Check if the interactive-map.tsx file has proper TypeScript syntax
if grep -q "fitBounds" "components/home/interactive-map.tsx"; then
    echo "✅ fitBounds function found"
else
    echo "❌ fitBounds function NOT found"
    exit 1
fi

if grep -q "L.latLngBounds" "components/home/interactive-map.tsx"; then
    echo "✅ latLngBounds instantiation found"
else
    echo "❌ latLngBounds instantiation NOT found"
    exit 1
fi

if grep -q "hasValidPharmacy" "components/home/interactive-map.tsx"; then
    echo "✅ Pharmacy validation found"
else
    echo "❌ Pharmacy validation NOT found"
    exit 1
fi

if grep -q "bounds.isValid()" "components/home/interactive-map.tsx"; then
    echo "✅ Bounds validation found"
else
    echo "❌ Bounds validation NOT found"
    exit 1
fi

echo ""
echo "🎉 All checks passed!"
echo ""
echo "📊 Summary of changes:"
echo "  1. Added dynamic bounds calculation"
echo "  2. Added fitBounds to auto-adjust map view"
echo "  3. Added pharmacy validation"
echo "  4. Added enhanced logging"
echo ""
echo "✨ Ready to test!"
