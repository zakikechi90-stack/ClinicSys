"use server"

import { createClient } from "@/src/lib/supabase/server"
import { headers } from "next/headers"

export async function sendPatientMessage(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const dob = formData.get("dob") as string
  const phone = formData.get("phone") as string
  const doctorEmail = formData.get("doctorEmail") as string
  const message = formData.get("message") as string

  if (!firstName || !lastName || !dob || !phone || !doctorEmail || !message) {
    return { error: "Tous les champs sont requis." }
  }

  const supabase = await createClient()

  // 1. Rate limiting
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") || "unknown"

  const today = new Date().toISOString().split("T")[0]
  const { count } = await supabase
    .from("patient_messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_ip", ip)
    .gte("created_at", today)

  if (count && count >= 3) {
    return { error: "Vous avez atteint la limite de 3 messages par jour." }
  }

  // 2. Verify Doctor
  const validRoles = ["doctor", "chef"]
  const { data: docProfiles } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", doctorEmail)
    .in("role", validRoles)

  if (!docProfiles || docProfiles.length === 0) {
    return { error: "Médecin introuvable avec cet email." }
  }
  const profileId = docProfiles[0].id

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("profile_id", profileId)
    .single()

  if (!doctor) {
    return { error: "Médecin introuvable." }
  }

  // 3. Verify Patient
  const { data: patients } = await supabase
    .from("patients")
    .select("id")
    .ilike("first_name", firstName.trim())
    .ilike("last_name", lastName.trim())
    .eq("date_of_birth", dob)
    .eq("phone", phone)

  if (!patients || patients.length === 0) {
    return { error: "Aucun dossier patient ne correspond à ces informations." }
  }

  const patientId = patients[0].id

  // 4. Verify Relationship (Consultation OR Appointment)
  const [consultationsRes, appointmentsRes] = await Promise.all([
    supabase
      .from("consultations")
      .select("id")
      .eq("patient_id", patientId)
      .eq("doctor_id", doctor.id)
      .limit(1),
    supabase
      .from("appointments")
      .select("id")
      .eq("patient_id", patientId)
      .eq("doctor_id", doctor.id)
      .limit(1),
  ])

  const hasConsultation = consultationsRes.data && consultationsRes.data.length > 0
  const hasAppointment = appointmentsRes.data && appointmentsRes.data.length > 0

  if (!hasConsultation && !hasAppointment) {
    return { error: "Ce patient n'est pas associé à ce médecin." }
  }

  // 5. Insert Message
  const { error: insertError } = await supabase
    .from("patient_messages")
    .insert({
      patient_id: patientId,
      doctor_id: doctor.id,
      message: message,
      sender_ip: ip
    })

  if (insertError) {
    console.error("Patient Message Insert Error:", insertError)
    return { error: "Erreur lors de l'envoi du message." }
  }

  // 6. Insert Notification via RPC to bypass RLS safely
  const { error: notifError } = await supabase.rpc('create_system_notification', {
    p_title: "Nouveau message patient",
    p_message: message,
    p_recipient_id: profileId,
    p_related_patient_id: patientId
  })
    
  if (notifError) {
    console.error("Patient Message Notification Error:", notifError)
  }

  return { success: true }
}
