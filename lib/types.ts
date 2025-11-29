export type UserRole = "user" | "pharmacy" | "admin"

export type PrescriptionStatus = "pending" | "responded" | "accepted" | "rejected" | "completed"

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface PharmacyProfile {
  id: string
  pharmacy_name: string
  license_number: string
  address: string
  latitude: number | null
  longitude: number | null
  working_hours: Record<string, any> | null
  is_verified: boolean
  created_at: string
}

export interface Prescription {
  id: string
  user_id: string
  images_urls: string[]
  notes: string | null
  status: PrescriptionStatus
  user_latitude: number | null
  user_longitude: number | null
  created_at: string
  updated_at: string
}

export interface PrescriptionResponse {
  id: string
  prescription_id: string
  pharmacy_id: string
  available_medicines: Record<string, any>
  total_price: number
  notes: string | null
  estimated_ready_time: string | null
  created_at: string
  pharmacy?: PharmacyProfile
}

export interface UserMedicine {
  id: string
  user_id: string
  medicine_name: string
  dosage: string | null
  frequency: string | null
  start_date: string | null
  end_date: string | null
  notes: string | null
  reminder_enabled: boolean
  reminder_times: string[] | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  data: Record<string, any> | null
  created_at: string
}
