# Map Improvements TODO

## 1. Update Distance Calculation (app/actions/pharmacies.ts)
- [x] Replace Haversine formula with OSRM API for driving distances
- [x] Add function to fetch driving distance from OSRM
- [x] Update fetchPharmaciesWithLocation to use driving distances
- [x] Handle API errors gracefully with fallback to Haversine

## 2. Implement Dynamic Icon Scaling (components/home/interactive-map.tsx)
- [x] Add zoom event listener to map
- [x] Calculate icon size based on zoom level
- [x] Update pharmacy markers dynamically on zoom change
- [x] Prevent excessive icon growth at high zoom levels
- [x] Ensure icons shrink appropriately at low zoom levels

## 3. Testing and Optimization
- [ ] Test distance accuracy with OSRM API
- [ ] Verify icon scaling behavior across zoom levels
- [ ] Check performance with multiple pharmacies
- [ ] Optimize API calls if needed
