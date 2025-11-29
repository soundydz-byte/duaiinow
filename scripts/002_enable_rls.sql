-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Prescriptions RLS Policies
CREATE POLICY "Users can view their own prescriptions"
  ON prescriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pharmacies can view prescriptions"
  ON prescriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'pharmacy'
    )
  );

-- Prescription Responses RLS Policies
CREATE POLICY "Users can view responses to their prescriptions"
  ON prescription_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prescriptions
      WHERE prescriptions.id = prescription_responses.prescription_id
      AND prescriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Pharmacies can view their responses"
  ON prescription_responses FOR SELECT
  USING (auth.uid() = pharmacy_id);

CREATE POLICY "Pharmacies can create responses"
  ON prescription_responses FOR INSERT
  WITH CHECK (auth.uid() = pharmacy_id);
