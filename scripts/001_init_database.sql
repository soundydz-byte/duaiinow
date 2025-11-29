-- Users and Authentication Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role TEXT CHECK (role IN ('user', 'pharmacy', 'admin')) DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pharmacy Details
CREATE TABLE IF NOT EXISTS pharmacy_profiles (
  id UUID PRIMARY KEY REFERENCES profiles (id) ON DELETE CASCADE,
  pharmacy_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  phone VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  working_hours JSONB,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  notes TEXT,
  priority VARCHAR(20) CHECK (priority IN ('normal', 'urgent')) DEFAULT 'normal',
  status VARCHAR(50) CHECK (status IN ('pending', 'responded', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescription Responses from Pharmacies
CREATE TABLE IF NOT EXISTS prescription_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions (id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_profiles (id) ON DELETE CASCADE,
  available_medicines JSONB,
  total_price DECIMAL(10, 2),
  notes TEXT,
  estimated_ready_time TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(prescription_id, pharmacy_id)
);

-- User Medicines
CREATE TABLE IF NOT EXISTS user_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  reminder_enabled BOOLEAN DEFAULT FALSE,
  reminder_times TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_profiles (id) ON DELETE CASCADE,
  plan VARCHAR(20) CHECK (plan IN ('monthly', 'yearly')),
  status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'expired')) DEFAULT 'pending',
  payment_proof_url TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescription_responses_pharmacy ON prescription_responses(pharmacy_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_pharmacy_location ON pharmacy_profiles(latitude, longitude);
