import { createClient } from '@supabase/supabase-js';

/**
 * 🧪 Test script to verify pharmacy data and icon rendering fix
 * 
 * This script checks:
 * 1. Database connection
 * 2. Pharmacy data exists and is valid
 * 3. Subscriptions are active
 * 4. Coordinates are properly formatted
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPharmacyData() {
  console.log('🧪 Starting pharmacy data test...\n');

  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profileError) {
      console.error('❌ Database connection failed:', profileError.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // 2. Fetch all pharmacies
    console.log('2️⃣ Fetching pharmacies...');
    const { data: pharmacies, error: pharmacyError } = await supabase
      .from('pharmacy_profiles')
      .select(`
        id,
        pharmacy_name,
        latitude,
        longitude,
        is_verified,
        subscriptions (
          id,
          status,
          expires_at
        )
      `);

    if (pharmacyError) {
      console.error('❌ Failed to fetch pharmacies:', pharmacyError.message);
      return;
    }

    console.log(`✅ Found ${pharmacies.length} pharmacies\n`);

    // 3. Validate each pharmacy
    console.log('3️⃣ Validating pharmacy data...');
    let validCount = 0;
    let invalidCount = 0;

    pharmacies.forEach((pharmacy, index) => {
      console.log(`\n📍 Pharmacy ${index + 1}: ${pharmacy.pharmacy_name}`);
      
      // Check verification status
      console.log(`  - Verified: ${pharmacy.is_verified ? '✅' : '❌'}`);
      
      // Check coordinates
      const latValid = typeof pharmacy.latitude === 'number' && isFinite(pharmacy.latitude);
      const lngValid = typeof pharmacy.longitude === 'number' && isFinite(pharmacy.longitude);
      
      console.log(`  - Latitude: ${latValid ? '✅' : '❌'} ${pharmacy.latitude}`);
      console.log(`  - Longitude: ${lngValid ? '✅' : '❌'} ${pharmacy.longitude}`);
      
      // Check subscriptions
      const subscriptions = pharmacy.subscriptions || [];
      console.log(`  - Subscriptions: ${subscriptions.length}`);
      
      let hasActiveSubscription = false;
      subscriptions.forEach((sub) => {
        const expiresAt = new Date(sub.expires_at);
        const now = new Date();
        const isActive = expiresAt > now && sub.status === 'active';
        
        console.log(`    - ${sub.status}: expires ${expiresAt.toLocaleDateString()} ${isActive ? '✅ ACTIVE' : '❌ EXPIRED'}`);
        
        if (isActive) hasActiveSubscription = true;
      });
      
      // Overall status
      const isValid = latValid && lngValid && pharmacy.is_verified && hasActiveSubscription;
      if (isValid) {
        console.log(`  ✅ VALID - Ready to display on map`);
        validCount++;
      } else {
        console.log(`  ❌ INVALID - Will not display on map`);
        invalidCount++;
      }
    });

    // Summary
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 Summary:`);
    console.log(`  - Total pharmacies: ${pharmacies.length}`);
    console.log(`  - Valid (will display): ${validCount} ✅`);
    console.log(`  - Invalid (won't display): ${invalidCount} ❌`);
    console.log(`${'='.repeat(50)}\n`);

    if (validCount > 0) {
      console.log('🎉 Good news! Your pharmacies should display on the map!');
      console.log('\nDebug checklist:');
      console.log('1. Check browser console for "Fitting map bounds" message');
      console.log('2. Verify 💊 icons appear on the Leaflet map');
      console.log('3. Check that zoom level auto-adjusts to show all pharmacies');
    } else {
      console.log('⚠️ No valid pharmacies found. Check the issues above.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPharmacyData();
