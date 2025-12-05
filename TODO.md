# Pharmacy Profile Fix TODO

## Issue Description
Pharmacies logging in see "غير محدد" (not specified) for all profile fields. Editing and saving doesn't persist data. Location setting shows "لم يتم تحديد الموقع" even after updating.

## Root Cause
- `pharmacy_profiles` table row not created for existing pharmacy users.
- No automatic creation of `pharmacy_profiles` on signup for pharmacy role users.
- Update operations fail on non-existent rows.

## Fixes Applied

### 1. Frontend Fix (app/pharmacy/profile/page.tsx)
- [x] Modified `useEffect` to create `pharmacy_profiles` row if missing for pharmacy users.
- [x] Changed `handleSave` to use `upsert` instead of `update` for pharmacy data.
- [x] Added error handling in `handleSave`.

### 2. Database Trigger Fix (scripts/002_create_profile_trigger.sql)
- [x] Updated `handle_new_user` function to automatically create `pharmacy_profiles` row for new pharmacy users.

## Remaining Tasks

### 3. Apply Database Changes
- [ ] Run the updated `scripts/002_create_profile_trigger.sql` in Supabase SQL Editor to update the trigger for future signups.

### 4. Test the Fix
- [ ] Login as existing pharmacy user.
- [ ] Verify profile fields show correct data (not "غير محدد").
- [ ] Edit and save profile information.
- [ ] Verify data persists after refresh.
- [ ] Set/update location and verify it shows as set.

### 5. Optional: Migrate Existing Pharmacies
- [ ] If needed, run a script to create `pharmacy_profiles` for existing pharmacy users without one.
