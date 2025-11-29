"use server"

import { createClient } from "@/lib/supabase/server"

export async function sendMedicineToPatient(data: {
  userId: string
  prescriptionId: string
  medicineName: string
  dosage: string
  frequency: string
  instructions: string
  startDate?: string
  endDate?: string
  reminderTimes?: string[]
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("غير مصرح")
  }

  // Get pharmacy info
  const { data: pharmacyData } = await supabase
    .from("pharmacy_profiles")
    .select("pharmacy_name")
    .eq("id", user.id)
    .single()

  // Insert medicine into pharmacy_patient_medicines
  const { error: medicineError } = await supabase.from("pharmacy_patient_medicines").insert({
    user_id: data.userId,
    pharmacy_id: user.id,
    prescription_id: data.prescriptionId,
    medicine_name: data.medicineName,
    dosage: data.dosage,
    frequency: data.frequency,
    instructions: data.instructions,
    start_date: data.startDate || null,
    end_date: data.endDate || null,
    reminder_times: data.reminderTimes || [],
  })

  if (medicineError) throw medicineError

  // Also insert into user_medicines so it appears in patient's medicines list
  const { error: userMedicineError } = await supabase.from("user_medicines").insert({
    user_id: data.userId,
    medicine_name: data.medicineName,
    dosage: data.dosage,
    frequency: data.frequency,
    start_date: data.startDate || null,
    end_date: data.endDate || null,
    notes: data.instructions, // Use instructions as notes
    reminder_enabled: (data.reminderTimes && data.reminderTimes.length > 0) || false,
    reminder_times: data.reminderTimes || [],
    pharmacy_id: user.id,
    pharmacy_name: pharmacyData?.pharmacy_name,
  })

  if (userMedicineError) throw userMedicineError

  // Create notification
  const { error: notifError } = await supabase.from("notifications").insert({
    user_id: data.userId,
    title: "دواء جديد من الصيدلية",
    message: `تم إضافة ${data.medicineName} إلى قائمة أدويتك من ${pharmacyData?.pharmacy_name || "الصيدلية"}`,
    type: "medicine_added",
    data: {
      medicine_name: data.medicineName,
      pharmacy_name: pharmacyData?.pharmacy_name,
    },
  })

  if (notifError) throw notifError

  return { success: true }
}
