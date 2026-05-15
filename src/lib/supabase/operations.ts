import { createClient } from "@/src/lib/supabase/client"
import type { TablesInsert, TablesUpdate } from "@/src/lib/supabase/types"

const supabase = createClient()

// ============================================================
// AUTH OPERATIONS
// ============================================================

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error

  // Fetch profile to get role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single()
  if (profileError) throw profileError

  return { user: data.user, session: data.session, profile }
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return { user, profile }
}

// ============================================================
// PATIENT OPERATIONS
// ============================================================

export async function createPatient(patient: TablesInsert<"patients">) {
  const { data, error } = await supabase
    .from("patients")
    .insert(patient)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPatients(filters?: {
  status?: string
  doctorId?: string
  search?: string
}) {
  let query = supabase.from("patients_with_doctor").select("*")
  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.doctorId) query = query.eq("primary_doctor_id", filters.doctorId)
  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
    )
  }
  const { data, error } = await query.order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function getPatientById(id: string) {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function updatePatient(id: string, updates: TablesUpdate<"patients">) {
  const { data, error } = await supabase
    .from("patients")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePatient(id: string) {
  const { error } = await supabase.from("patients").delete().eq("id", id)
  if (error) throw error
}

// ============================================================
// DOCTOR OPERATIONS
// ============================================================

export async function assignDoctor(patientId: string, doctorId: string) {
  const { data, error } = await supabase
    .from("patients")
    .update({ primary_doctor_id: doctorId })
    .eq("id", patientId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getDoctors() {
  const { data, error } = await supabase
    .from("doctors")
    .select("*, profiles!doctors_profile_id_fkey(full_name, email), services(name)")
    .eq("is_available", true)
  if (error) throw error
  return data
}

export async function getDoctorByProfileId(profileId: string) {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("profile_id", profileId)
    .single()
  if (error) throw error
  return data
}

// ============================================================
// APPOINTMENT OPERATIONS
// ============================================================

export async function createAppointment(appointment: TablesInsert<"appointments">) {
  const { data, error } = await supabase
    .from("appointments")
    .insert(appointment)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAppointments(filters?: {
  doctorId?: string
  date?: string
  status?: string
}) {
  let query = supabase.from("appointments_detail").select("*")
  if (filters?.doctorId) query = query.eq("doctor_id", filters.doctorId)
  if (filters?.date) query = query.eq("appointment_date", filters.date)
  if (filters?.status) query = query.eq("status", filters.status)
  const { data, error } = await query.order("appointment_date", { ascending: true })
  if (error) throw error
  return data
}

export async function updateAppointment(id: string, updates: TablesUpdate<"appointments">) {
  const { data, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// CONSULTATION OPERATIONS
// ============================================================

export async function createConsultation(consultation: TablesInsert<"consultations">) {
  const { data, error } = await supabase
    .from("consultations")
    .insert(consultation)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getConsultationHistory(patientId: string) {
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("patient_id", patientId)
    .order("consultation_date", { ascending: false })
  if (error) throw error
  return data
}

// ============================================================
// HOSPITALIZATION OPERATIONS
// ============================================================

export async function admitPatient(hospitalization: TablesInsert<"hospitalizations">) {
  // Triggers handle bed status and patient status automatically
  const { data, error } = await supabase
    .from("hospitalizations")
    .insert({ ...hospitalization, status: "hospitalized" })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function dischargePatient(hospitalizationId: string, notes?: string) {
  // Triggers handle bed status and patient status automatically
  const { data, error } = await supabase
    .from("hospitalizations")
    .update({
      status: "discharged",
      discharge_date: new Date().toISOString(),
      discharge_notes: notes || null,
    })
    .eq("id", hospitalizationId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function transferPatient(hospitalizationId: string, newRoomId: string, newBedId: string) {
  // Triggers handle freeing the old bed and occupying the new one automatically
  const { data, error } = await supabase
    .from("hospitalizations")
    .update({
      room_id: newRoomId,
      bed_id: newBedId,
    })
    .eq("id", hospitalizationId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getHospitalizations(filters?: {
  status?: string
  doctorId?: string
}) {
  let query = supabase.from("hospitalizations_detail").select("*")
  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.doctorId) query = query.eq("doctor_id", filters.doctorId)
  const { data, error } = await query.order("admission_date", { ascending: false })
  if (error) throw error
  return data
}

// ============================================================
// INVOICE & PAYMENT OPERATIONS
// ============================================================

export async function generateInvoice(invoice: Omit<TablesInsert<"invoices">, "invoice_number">) {
  const { data, error } = await supabase
    .from("invoices")
    .insert({ ...invoice, invoice_number: "" }) // Auto-generated by trigger
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markPayment(payment: TablesInsert<"payments">) {
  const { data, error } = await supabase
    .from("payments")
    .insert(payment)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getInvoices(filters?: { status?: string; patientId?: string }) {
  let query = supabase.from("invoices").select("*, patients(first_name, last_name)")
  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.patientId) query = query.eq("patient_id", filters.patientId)
  const { data, error } = await query.order("created_at", { ascending: false })
  if (error) throw error
  return data
}

// ============================================================
// ROOM & BED OPERATIONS
// ============================================================

export async function getRoomsWithBeds() {
  const { data, error } = await supabase
    .from("rooms_with_beds")
    .select("*")
    .order("room_number")
  if (error) throw error
  return data
}

export async function getAvailableBeds(roomId: string) {
  const { data, error } = await supabase
    .from("beds")
    .select("*")
    .eq("room_id", roomId)
    .eq("status", "available")
    .order("bed_number")
  if (error) throw error
  return data
}

// ============================================================
// SERVICE OPERATIONS
// ============================================================

export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("name")
  if (error) throw error
  return data
}

export async function createService(service: TablesInsert<"services">) {
  const { data, error } = await supabase
    .from("services")
    .insert(service)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// AMBULANCE OPERATIONS
// ============================================================

export async function createAmbulanceRequest(request: TablesInsert<"ambulance_requests">) {
  const { data, error } = await supabase
    .from("ambulance_requests")
    .insert(request)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAmbulanceRequests(status?: string) {
  let query = supabase.from("ambulance_requests").select("*")
  if (status) query = query.eq("status", status)
  const { data, error } = await query.order("created_at", { ascending: false })
  if (error) throw error
  return data
}

// ============================================================
// NOTIFICATION OPERATIONS
// ============================================================

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

// ============================================================
// TREATMENT OPERATIONS (Nurse)
// ============================================================

export async function createTreatment(treatment: TablesInsert<"treatments">) {
  const { data, error } = await supabase
    .from("treatments")
    .insert(treatment)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// DASHBOARD STATISTICS
// ============================================================

export async function getDashboardStats() {
  const { data, error } = await supabase.rpc("get_dashboard_stats")
  if (error) throw error
  return data as {
    total_patients: number
    total_doctors: number
    total_nurses: number
    total_rooms: number
    total_beds: number
    occupied_beds: number
    available_beds: number
    total_appointments_today: number
    total_hospitalizations_active: number
    total_revenue: number
    pending_revenue: number
    total_invoices_pending: number
    total_users: number
  }
}

export async function getDoctorDashboardStats(doctorId: string) {
  const { data, error } = await supabase.rpc("get_doctor_stats", {
    p_doctor_id: doctorId,
  })
  if (error) throw error
  return data as {
    total_patients: number
    total_consultations: number
    today_appointments: number
    active_hospitalizations: number
  }
}

export async function getReceptionDashboardStats() {
  const { data, error } = await supabase.rpc("get_reception_stats")
  if (error) throw error
  return data as {
    total_patients: number
    today_appointments: number
    pending_ambulances: number
    unpaid_invoices: number
    active_hospitalizations: number
  }
}

export async function getMonthlyRevenue() {
  const { data, error } = await supabase.rpc("get_monthly_revenue")
  if (error) throw error
  return data as { month: string; revenue: number }[] | null
}

// ============================================================
// USER/PROFILE MANAGEMENT (Admin)
// ============================================================

export async function getProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function createUserWithRole(
  email: string,
  password: string,
  fullName: string,
  role: "admin" | "doctor" | "nurse" | "reception" | "chef"
) {
  // Sign up the user via Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })
  if (error) throw error
  return data
}

export async function updateProfile(id: string, updates: TablesUpdate<"profiles">) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// DOCTOR SCHEDULE OPERATIONS
// ============================================================

export async function getDoctorSchedules(doctorId?: string) {
  let query = supabase
    .from("doctor_schedules")
    .select("*, doctors(profile_id, profiles!doctors_profile_id_fkey(full_name))")
  if (doctorId) query = query.eq("doctor_id", doctorId)
  const { data, error } = await query.order("day_of_week").order("start_time")
  if (error) throw error
  return data
}

export async function createDoctorSchedule(schedule: TablesInsert<"doctor_schedules">) {
  const { data, error } = await supabase
    .from("doctor_schedules")
    .insert(schedule)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// ROOM MANAGEMENT (Admin)
// ============================================================

export async function createRoom(
  room: TablesInsert<"rooms">,
  numberOfBeds: number
) {
  const { data: roomData, error: roomError } = await supabase
    .from("rooms")
    .insert(room)
    .select()
    .single()
  if (roomError) throw roomError

  // Create beds for the room
  const beds = Array.from({ length: numberOfBeds }, (_, i) => ({
    room_id: roomData.id,
    bed_number: i + 1,
  }))

  const { error: bedsError } = await supabase.from("beds").insert(beds)
  if (bedsError) throw bedsError

  return roomData
}
