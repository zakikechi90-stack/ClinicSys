/**
 * Server-side Supabase queries
 * These functions are meant to be called from Server Components (page.tsx)
 * They use the server-side Supabase client with cookie-based auth.
 */

import { createClient } from "./server"

// ============================================================
// AUTH / PROFILE QUERIES
// ============================================================

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as unknown as { data: import("./types").Tables<"profiles"> | null }

  return { user, profile }
}

// ============================================================
// PATIENT QUERIES
// ============================================================

export async function fetchPatients(filters?: {
  status?: string
  doctorId?: string
  search?: string
  limit?: number
}) {
  const supabase = await createClient()
  let query = supabase.from("patients").select("*")

  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.doctorId)
    query = query.eq("primary_doctor_id", filters.doctorId)
  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
    )
  }
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query.order("created_at", {
    ascending: false,
  })
  if (error) throw error
  return data ?? []
}

export async function fetchPatientById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single() as unknown as { data: import("./types").Tables<"patients"> | null, error: any }
  if (error) throw error
  return data
}

export async function fetchPatientsWithDoctor(filters?: {
  doctorId?: string
  search?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from("patients")
    .select(
      `*, doctors:primary_doctor_id(id, profile_id, profiles:profile_id(full_name))`
    )

  if (filters?.doctorId)
    query = query.eq("primary_doctor_id", filters.doctorId)
  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  })
  if (error) throw error
  return data ?? []
}

export async function fetchDoctorPatientsDashboard(doctorId: string) {
  const supabase = await createClient()
  const now = new Date()

  // Format as local YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Format as HH:MM:SS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;

  // 1. Get all appointments for this doctor
  const { data: appointments } = await supabase.from("appointments").select("patient_id, appointment_date, appointment_time, status").eq("doctor_id", doctorId);

  // 2. Get all hospitalizations for this doctor
  const { data: hospitalizations } = await supabase.from("hospitalizations").select("patient_id, status").eq("doctor_id", doctorId);

  // 3. Get all consultations for this doctor
  const { data: consultations } = await supabase.from("consultations").select("patient_id, consultation_date").eq("doctor_id", doctorId);

  // Collect unique patient IDs
  const patientIds = new Set<string>();
  appointments?.forEach((a: any) => patientIds.add(a.patient_id));
  hospitalizations?.forEach((h: any) => patientIds.add(h.patient_id));
  consultations?.forEach((c: any) => patientIds.add(c.patient_id));

  // Also include patients where primary_doctor_id is this doctor
  const { data: primaryPatients } = await supabase.from("patients").select("id").eq("primary_doctor_id", doctorId);
  primaryPatients?.forEach((p: any) => patientIds.add(p.id));

  if (patientIds.size === 0) return [];

  // Fetch the patients
  const { data: patients } = await supabase
    .from("patients")
    .select("*, doctors:primary_doctor_id(id, profile_id, profiles:profile_id(full_name))")
    .in("id", Array.from(patientIds));

  if (!patients) return [];

  // Now, calculate the computed status and sort priority for each patient
  const enhancedPatients = patients.map((patient: any) => {
    const pAppts = appointments?.filter((a: any) => a.patient_id === patient.id) || [];
    const pHosps = hospitalizations?.filter((h: any) => h.patient_id === patient.id) || [];
    const pCons = consultations?.filter((c: any) => c.patient_id === patient.id) || [];

    let computedStatus = "Rendez-vous terminé";
    let badgeVariant = "secondary";
    let badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    let sortPriority = 4; // Lower is better

    // Check Hospitalized
    const isHospitalized = pHosps.some((h: any) => h.status === "hospitalized");

    // Check Appointments
    const todayAppts = pAppts.filter((a: any) => a.appointment_date === todayStr && a.status !== "cancelled" && a.status !== "completed" && a.appointment_time >= timeStr);

    // Future appointments including today's future
    const futureAppts = pAppts.filter((a: any) =>
      a.status !== "cancelled" && a.status !== "completed" &&
      (a.appointment_date > todayStr || (a.appointment_date === todayStr && a.appointment_time >= timeStr))
    );

    if (isHospitalized) {
      computedStatus = "Hospitalisé";
      badgeVariant = "secondary";
      badgeColor = "bg-orange-500/10 text-orange-600 border-orange-500/20";
      sortPriority = 1;
    } else if (todayAppts.length > 0) {
      computedStatus = "Consultation";
      badgeVariant = "default";
      badgeColor = "bg-blue-500/10 text-blue-600 border-blue-500/20";
      sortPriority = 2;
    } else if (futureAppts.length > 0) {
      computedStatus = "Rendez-vous à venir";
      badgeVariant = "outline";
      badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
      sortPriority = 3;
    }

    return {
      ...patient,
      computedStatus,
      badgeVariant,
      badgeColor,
      sortPriority
    };
  });

  // Sort patients:
  // 1. sortPriority (1 -> 4)
  // 2. Then alphabetically by first name
  enhancedPatients.sort((a, b) => {
    if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority;
    return a.first_name.localeCompare(b.first_name);
  });

  return enhancedPatients;
}

// ============================================================
// DOCTOR QUERIES
// ============================================================

export async function fetchDoctors() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .select(
      "*, profiles:profile_id(full_name, email), services:service_id(id, name)"
    )
    .eq("is_available", true)
  if (error) throw error
  return data ?? []
}

export async function fetchDoctorByProfileId(profileId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("profile_id", profileId)
    .single() as unknown as { data: import("./types").Tables<"doctors"> | null, error: any }
  if (error) return null
  return data
}

export async function fetchDoctorsByService(serviceId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .select("*, profiles:profile_id(full_name)")
    .eq("service_id", serviceId)
    .eq("is_available", true)
  if (error) throw error
  return data ?? []
}

// ============================================================
// APPOINTMENT QUERIES
// ============================================================

export async function fetchAppointments(filters?: {
  doctorId?: string
  date?: string
  status?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from("appointments")
    .select(
      `*, 
      patients:patient_id(id, first_name, last_name),
      doctors:doctor_id(id, profile_id, profiles:profile_id(full_name)),
      services:service_id(id, name)`
    )

  if (filters?.doctorId) query = query.eq("doctor_id", filters.doctorId)
  if (filters?.date) query = query.eq("appointment_date", filters.date)
  if (filters?.status) query = query.eq("status", filters.status)

  const { data, error } = await query.order("appointment_date", {
    ascending: true,
  })
  if (error) throw error

  // Apply dynamic status
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return (data ?? []).map(appt => {
    let computedStatus = appt.status;
    if (appt.status !== 'cancelled' && appt.status !== 'completed') {
      if (appt.appointment_date < todayStr || (appt.appointment_date === todayStr && appt.appointment_time < timeStr)) {
        computedStatus = 'completed';
      } else {
        computedStatus = 'scheduled';
      }
    }
    return { ...appt, status: computedStatus };
  });
}

export async function fetchTodayAppointmentsCount(doctorId?: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]
  let query = supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("appointment_date", today)

  if (doctorId) query = query.eq("doctor_id", doctorId)

  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

export async function fetchTodayAppointmentsForDoctor(doctorId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `*, patients:patient_id(id, first_name, last_name), services:service_id(id, name)`
    )
    .eq("doctor_id", doctorId)
    .eq("appointment_date", today)
    .order("appointment_time", { ascending: true })
  if (error) throw error
  
  // Apply dynamic status
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return (data ?? []).map(appt => {
    let computedStatus = appt.status;
    if (appt.status !== 'cancelled' && appt.status !== 'completed') {
      if (appt.appointment_date < todayStr || (appt.appointment_date === todayStr && appt.appointment_time < timeStr)) {
        computedStatus = 'completed';
      } else {
        computedStatus = 'scheduled';
      }
    }
    return { ...appt, status: computedStatus };
  });
}

export async function fetchAllTodayAppointments() {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `*, patients:patient_id(id, first_name, last_name), doctors:doctor_id(id, profile_id, profiles:profile_id(full_name)), services:service_id(id, name)`
    )
    .eq("appointment_date", today)
    .order("appointment_time", { ascending: true })
  if (error) throw error
  
  // Apply dynamic status
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return (data ?? []).map(appt => {
    let computedStatus = appt.status;
    if (appt.status !== 'cancelled' && appt.status !== 'completed') {
      if (appt.appointment_date < todayStr || (appt.appointment_date === todayStr && appt.appointment_time < timeStr)) {
        computedStatus = 'completed';
      } else {
        computedStatus = 'scheduled';
      }
    }
    return { ...appt, status: computedStatus };
  });
}

// ============================================================
// CONSULTATION QUERIES
// ============================================================

export async function fetchConsultationsByPatient(patientId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("consultations")
    .select(
      `*, doctors:doctor_id(profiles:profile_id(full_name))`
    )
    .eq("patient_id", patientId)
    .order("consultation_date", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchConsultationsByDoctor(doctorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("consultations")
    .select(
      `*, patients:patient_id(first_name, last_name)`
    )
    .eq("doctor_id", doctorId)
    .order("consultation_date", { ascending: false })
  if (error) throw error
  return data ?? []
}

// ============================================================
// HOSPITALIZATION QUERIES
// ============================================================

export async function fetchHospitalizations(filters?: {
  status?: string
  doctorId?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from("hospitalizations")
    .select(
      `*, 
      patients:patient_id(id, first_name, last_name),
      doctors:doctor_id(id, profiles:profile_id(full_name)),
      rooms:room_id(id, room_number),
      beds:bed_id(id, bed_number),
      services:service_id(id, name)`
    )

  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.doctorId) query = query.eq("doctor_id", filters.doctorId)

  const { data, error } = await query.order("admission_date", {
    ascending: false,
  })
  if (error) throw error
  return data ?? []
}

export async function fetchActiveHospitalizationsCount() {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("hospitalizations")
    .select("id", { count: "exact", head: true })
    .in("status", ["waiting", "hospitalized"])
  if (error) throw error
  return count ?? 0
}

// ============================================================
// INVOICE / BILLING QUERIES
// ============================================================

export async function fetchInvoices(filters?: {
  status?: string
  patientId?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from("invoices")
    .select("*, patients:patient_id(id, first_name, last_name)")

  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.patientId) query = query.eq("patient_id", filters.patientId)

  const { data, error } = await query.order("created_at", {
    ascending: false,
  })
  if (error) throw error
  return data ?? []
}

export async function fetchUnpaidInvoicesCount() {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending", "overdue", "partially_paid"])
  if (error) throw error
  return count ?? 0
}

export async function fetchTotalRevenue() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("paid_amount")
    .eq("status", "paid")
  if (error) throw error
  return (data as any[])?.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0) ?? 0
}

// ============================================================
// ROOM / BED QUERIES
// ============================================================

export async function fetchRoomsWithBeds() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("rooms")
    .select(
      `*, 
      services:service_id(id, name), 
      beds(id, bed_number, status),
      hospitalizations(id, status)`
    )
    .eq("is_active", true)
    .order("room_number")

  if (error) throw error

  return ((data as any[]) ?? []).map((room: any) => {
    const total_beds = room.beds?.length ?? 0
    const occupied_beds = room.hospitalizations?.filter((h: any) => h.status === "hospitalized").length ?? 0

    return {
      ...room,
      total_beds,
      occupied_beds,
      available_beds: Math.max(0, total_beds - occupied_beds),
    }
  })
}

export async function fetchAvailableBeds(roomId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("beds")
    .select("*")
    .eq("room_id", roomId)
    .eq("status", "available")
    .order("bed_number")
  if (error) throw error
  return data ?? []
}

// ============================================================
// SERVICE QUERIES
// ============================================================

export async function fetchServices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("name")
  if (error) throw error
  return data ?? []
}

// ============================================================
// AMBULANCE QUERIES
// ============================================================

export async function fetchAmbulanceRequests(status?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("ambulance_requests")
    .select("*, patients:patient_id(id, first_name, last_name)")

  if (status) query = query.eq("status", status)

  const { data, error } = await query.order("created_at", {
    ascending: false,
  })
  if (error) throw error
  return data ?? []
}

export async function fetchPendingAmbulanceCount() {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("ambulance_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
  if (error) throw error
  return count ?? 0
}

// ============================================================
// NOTIFICATION QUERIES
// ============================================================

export async function fetchNotifications(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*, patients:related_patient_id(first_name, last_name)")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)
  if (error) throw error
  return data ?? []
}

// ============================================================
// USER / PROFILE QUERIES (Admin)
// ============================================================

export async function fetchProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

// ============================================================
// DOCTOR SCHEDULE QUERIES
// ============================================================

export async function fetchDoctorSchedules(doctorId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("doctor_schedules")
    .select(
      "*, doctors:doctor_id(id, profile_id, profiles:profile_id(full_name))"
    )

  if (doctorId) query = query.eq("doctor_id", doctorId)

  const { data, error } = await query
    .order("day_of_week")
    .order("start_time")
  if (error) throw error
  return data ?? []
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function fetchReceptionStats() {
  const supabase = await createClient()
  // Use timezone-aware current date and time
  const now = new Date();

  // Format as local YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Format as HH:MM:SS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;

  const [patientsRes, appointmentsRes, ambulanceRes, hospitalizationsRes, invoicesRes] =
    await Promise.all([
      supabase
        .from("patients")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .not("status", "in", '("cancelled","completed")')
        .or(`appointment_date.gt.${todayStr},and(appointment_date.eq.${todayStr},appointment_time.gte.${timeStr})`),
      supabase
        .from("ambulance_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("hospitalizations")
        .select("id", { count: "exact", head: true })
        .in("status", ["waiting", "hospitalized"]),
      supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ])

  return {
    total_patients: patientsRes.count ?? 0,
    today_appointments: appointmentsRes.count ?? 0,
    pending_ambulances: ambulanceRes.count ?? 0,
    active_hospitalizations: hospitalizationsRes.count ?? 0,
    pending_invoices: invoicesRes.count ?? 0,
  }
}

export async function fetchDoctorStats(doctorId: string) {
  const supabase = await createClient()
  
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const [patientsRes, consultationsRes, todayAppsRes, completedAppsRes, upcomingAppsRes] = await Promise.all([
    supabase
      .from("patients")
      .select("id", { count: "exact", head: true })
      .eq("primary_doctor_id", doctorId),
    supabase
      .from("consultations")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", doctorId),
    // All today
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", doctorId)
      .eq("appointment_date", todayStr),
    // Completed today (status completed OR past time)
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", doctorId)
      .eq("appointment_date", todayStr)
      .or(`status.eq.completed,and(status.not.eq.cancelled,appointment_time.lt.${timeStr})`),
    // Upcoming today
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", doctorId)
      .eq("appointment_date", todayStr)
      .not("status", "in", '("cancelled","completed")')
      .gte("appointment_time", timeStr),
  ])

  return {
    total_patients: patientsRes.count ?? 0,
    total_consultations: consultationsRes.count ?? 0,
    today_appointments: todayAppsRes.count ?? 0,
    completed_today: completedAppsRes.count ?? 0,
    upcoming_today: upcomingAppsRes.count ?? 0,
  }
}

export async function fetchNurseStats() {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("hospitalizations")
    .select("id", { count: "exact", head: true })
    .eq("status", "hospitalized")
  if (error) throw error
  return { total_hospitalized: count ?? 0 }
}

export async function fetchAdminStats() {
  const supabase = await createClient()

  const now = new Date();

  // Format as local YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Format as HH:MM:SS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;

  const firstOfMonth = new Date(year, now.getMonth(), 1).toISOString();

  // Build 7-day date strings for appointment chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(year, now.getMonth(), now.getDate() - (6 - i));
    const dYear = d.getFullYear();
    const dMonth = String(d.getMonth() + 1).padStart(2, '0');
    const dDay = String(d.getDate()).padStart(2, '0');
    return `${dYear}-${dMonth}-${dDay}`;
  })

  const [
    // Users
    totalUsersRes,
    activeUsersRes,
    doctorsCountRes,
    nursesCountRes,
    receptionCountRes,
    // Patients
    totalPatientsRes,
    newTodayPatientsRes,
    hospitalizedPatientsRes,
    consultationPatientsRes,
    // Appointments
    todayAppsRes,
    completedAppsRes,
    upcomingAppsRes,
    // Beds
    totalBedsRes,
    // hospitalizations_active (truth for occupied beds)
    activeHospitalizationsRes,
    // Rooms
    totalRoomsRes,
    // Services
    totalServicesRes,
    // Invoices
    paidInvoicesRes,
    pendingInvoicesRes,
    allPaidInvoicesAmountRes,
    monthInvoicesAmountRes,
    // Ambulance
    ambulanceCompletedRes,
    ambulancePendingRes,
    ambulanceUrgentRes,
  ] = await Promise.all([
    // Users
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "doctor"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "nurse"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "reception"),
    // Patients
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase.from("patients").select("id", { count: "exact", head: true }).gte("created_at", todayStr),
    supabase.from("patients").select("id", { count: "exact", head: true }).eq("status", "hospitalized"),
    supabase.from("patients").select("id", { count: "exact", head: true }).eq("status", "consultation"),
    // Appointments (Time-based logic: past time = completed)
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("appointment_date", todayStr),
    supabase.from("appointments").select("id", { count: "exact", head: true })
      .eq("appointment_date", todayStr)
      .or(`status.eq.completed,and(status.not.eq.cancelled,appointment_time.lt.${timeStr})`),
    supabase.from("appointments").select("id", { count: "exact", head: true })
      .not("status", "in", '("cancelled","completed")')
      .or(`appointment_date.gt.${todayStr},and(appointment_date.eq.${todayStr},appointment_time.gte.${timeStr})`),
    // Beds (only count beds from active rooms)
    supabase.from("beds").select("id, rooms!inner(id)", { count: "exact", head: true }).eq("rooms.is_active", true),
    // Active hospitalizations (The real source of truth for occupied beds)
    supabase.from("hospitalizations").select("id", { count: "exact", head: true }).eq("status", "hospitalized"),
    // Rooms
    supabase.from("rooms").select("id", { count: "exact", head: true }).eq("is_active", true),
    // Services
    supabase.from("services").select("id", { count: "exact", head: true }).eq("is_active", true),
    // Invoices counts
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "paid"),
    supabase.from("invoices").select("id", { count: "exact", head: true }).in("status", ["pending", "overdue"]),
    // Revenue total (paid invoices)
    supabase.from("invoices").select("paid_amount").eq("status", "paid"),
    // Revenue this month
    supabase.from("invoices").select("paid_amount").eq("status", "paid").gte("created_at", firstOfMonth),
    // Ambulance
    supabase.from("ambulance_requests").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("ambulance_requests").select("id", { count: "exact", head: true }).in("status", ["pending", "dispatched", "en_route"]),
    supabase.from("ambulance_requests").select("id", { count: "exact", head: true }).in("priority", ["high", "critical"]),
  ])

  // Appointments per day for last 7 days
  const appsLast7Days = await supabase
    .from("appointments")
    .select("appointment_date, status")
    .in("appointment_date", last7Days)

  const appointmentChartData = last7Days.map((dateStr) => {
    const dayApps = (appsLast7Days.data ?? []).filter((a: any) => a.appointment_date === dateStr)
    const d = new Date(dateStr)
    const label = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })
    return {
      date: dateStr,
      label,
      total: dayApps.length,
      completed: dayApps.filter((a: any) => a.status === "completed").length,
      cancelled: dayApps.filter((a: any) => a.status === "cancelled").length,
    }
  })

  const revenueMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(year, now.getMonth() - (5 - i), 1)
    return {
      label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      start: d.toISOString(),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString(),
    }
  })

  const revenueChartPromises = revenueMonths.map(({ start, end }) =>
    supabase.from("invoices").select("paid_amount").eq("status", "paid").gte("created_at", start).lt("created_at", end)
  )
  const revenueChartResults = await Promise.all(revenueChartPromises)
  const revenueChartData = revenueMonths.map((m, i) => ({
    label: m.label,
    revenue: (revenueChartResults[i].data ?? []).reduce((s: number, inv: any) => s + (Number(inv.paid_amount) || 0), 0),
  }))

  // Compute derived values
  const totalBeds = totalBedsRes.count ?? 0

  // Lits Occupés = nombre réel des patients hospitalisés
  const occupiedBeds = hospitalizedPatientsRes.count ?? 0

  // Lits Disponibles = Total Lits - Lits Occupés
  const availableBeds = Math.max(0, totalBeds - occupiedBeds)

  // Taux d'occupation
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

  const totalInvoices = (paidInvoicesRes.count ?? 0) + (pendingInvoicesRes.count ?? 0)
  const paymentRate = totalInvoices > 0 ? Math.round(((paidInvoicesRes.count ?? 0) / totalInvoices) * 100) : 0

  const todayAppsTotal = todayAppsRes.count ?? 0
  const completedApps = completedAppsRes.count ?? 0
  const appointmentCompletionRate = todayAppsTotal > 0 ? Math.round((completedApps / todayAppsTotal) * 100) : 0

  const totalRevenue = (allPaidInvoicesAmountRes.data ?? []).reduce((s: number, inv: any) => s + (Number(inv.paid_amount) || 0), 0)
  const monthRevenue = (monthInvoicesAmountRes.data ?? []).reduce((s: number, inv: any) => s + (Number(inv.paid_amount) || 0), 0)

  return {
    // Users
    total_users: totalUsersRes.count ?? 0,
    active_users: activeUsersRes.count ?? 0,
    inactive_users: Math.max(0, (totalUsersRes.count ?? 0) - (activeUsersRes.count ?? 0)),
    doctors_count: doctorsCountRes.count ?? 0,
    nurses_count: nursesCountRes.count ?? 0,
    reception_count: receptionCountRes.count ?? 0,
    // Patients
    total_patients: totalPatientsRes.count ?? 0,
    new_patients_today: newTodayPatientsRes.count ?? 0,
    hospitalized_patients: hospitalizedPatientsRes.count ?? 0,
    consultation_patients: consultationPatientsRes.count ?? 0,
    // Appointments
    today_appointments: todayAppsRes.count ?? 0,
    completed_appointments: completedAppsRes.count ?? 0,
    upcoming_appointments: upcomingAppsRes.count ?? 0,
    appointment_completion_rate: appointmentCompletionRate,
    appointment_chart_data: appointmentChartData,
    // Beds & Rooms
    total_beds: totalBeds,
    occupied_beds: occupiedBeds,
    available_beds: availableBeds,
    bed_occupancy_rate: bedOccupancyRate,
    total_rooms: totalRoomsRes.count ?? 0,
    // Services
    total_services: totalServicesRes.count ?? 0,
    // Invoices & Revenue
    paid_invoices: paidInvoicesRes.count ?? 0,
    pending_invoices: pendingInvoicesRes.count ?? 0,
    total_revenue: totalRevenue,
    month_revenue: monthRevenue,
    payment_rate: paymentRate,
    revenue_chart_data: revenueChartData,
    // Ambulance
    ambulance_completed: ambulanceCompletedRes.count ?? 0,
    ambulance_pending: ambulancePendingRes.count ?? 0,
    ambulance_urgent: ambulanceUrgentRes.count ?? 0,
    // Legacy (kept for backward compat)
    total_doctors: doctorsCountRes.count ?? 0,
  }
}

export async function fetchChefStats() {
  const supabase = await createClient()

  const [patientsRes, doctorsRes] = await Promise.all([
    supabase
      .from("patients")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("doctors")
      .select("id", { count: "exact", head: true }),
  ])

  return {
    total_patients: patientsRes.count ?? 0,
    total_doctors: doctorsRes.count ?? 0,
  }
}

// ============================================================
// TREATMENT QUERIES (Nurse)
// ============================================================

export async function fetchHospitalizedPatientsForNurse() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hospitalizations")
    .select(
      `*, 
      patients:patient_id(id, first_name, last_name),
      rooms:room_id(room_number),
      beds:bed_id(bed_number)`
    )
    .eq("status", "hospitalized")
    .order("admission_date", { ascending: false })
  if (error) throw error
  return data ?? []
}
