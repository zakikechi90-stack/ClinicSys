export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ambulance_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          destination: string | null
          id: string
          notes: string | null
          patient_id: string | null
          patient_name: string
          pickup_address: string
          priority: string | null
          requested_by: string | null
          status: Database["public"]["Enums"]["ambulance_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          pickup_address: string
          priority?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["ambulance_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          pickup_address?: string
          priority?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["ambulance_status"]
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          created_by: string | null
          doctor_id: string
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          created_by?: string | null
          doctor_id: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          created_by?: string | null
          doctor_id?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: []
      }
      beds: {
        Row: {
          bed_number: number
          created_at: string
          id: string
          room_id: string
          status: Database["public"]["Enums"]["bed_status"]
          updated_at: string
        }
        Insert: {
          bed_number: number
          created_at?: string
          id?: string
          room_id: string
          status?: Database["public"]["Enums"]["bed_status"]
          updated_at?: string
        }
        Update: {
          bed_number?: number
          created_at?: string
          id?: string
          room_id?: string
          status?: Database["public"]["Enums"]["bed_status"]
          updated_at?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          appointment_id: string | null
          blood_pressure: string | null
          consultation_date: string
          consultation_type: Database["public"]["Enums"]["consultation_type"]
          created_at: string
          diagnosis: string | null
          diagnosis_en: string | null
          doctor_id: string
          follow_up_date: string | null
          follow_up_notes: string | null
          heart_rate: number | null
          height_cm: number | null
          id: string
          lab_requests: string | null
          medications: string | null
          patient_id: string
          radiology_requests: string | null
          requires_hospitalization: boolean | null
          symptoms: string | null
          temperature: number | null
          treatment_plan: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          appointment_id?: string | null
          blood_pressure?: string | null
          consultation_date?: string
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string
          diagnosis?: string | null
          diagnosis_en?: string | null
          doctor_id: string
          follow_up_date?: string | null
          follow_up_notes?: string | null
          heart_rate?: number | null
          height_cm?: number | null
          id?: string
          lab_requests?: string | null
          medications?: string | null
          patient_id: string
          radiology_requests?: string | null
          requires_hospitalization?: boolean | null
          symptoms?: string | null
          temperature?: number | null
          treatment_plan?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          appointment_id?: string | null
          blood_pressure?: string | null
          consultation_date?: string
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string
          diagnosis?: string | null
          diagnosis_en?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          follow_up_notes?: string | null
          heart_rate?: number | null
          height_cm?: number | null
          id?: string
          lab_requests?: string | null
          medications?: string | null
          patient_id?: string
          radiology_requests?: string | null
          requires_hospitalization?: boolean | null
          symptoms?: string | null
          temperature?: number | null
          treatment_plan?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      doctor_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          consultation_fee: number | null
          created_at: string
          id: string
          is_available: boolean
          license_number: string | null
          profile_id: string
          service_id: string | null
          specialization: string | null
          specialization_en: string | null
          updated_at: string
        }
        Insert: {
          consultation_fee?: number | null
          created_at?: string
          id?: string
          is_available?: boolean
          license_number?: string | null
          profile_id: string
          service_id?: string | null
          specialization?: string | null
          specialization_en?: string | null
          updated_at?: string
        }
        Update: {
          consultation_fee?: number | null
          created_at?: string
          id?: string
          is_available?: boolean
          license_number?: string | null
          profile_id?: string
          service_id?: string | null
          specialization?: string | null
          specialization_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hospitalizations: {
        Row: {
          admission_date: string
          bed_id: string
          consultation_id: string | null
          created_at: string
          created_by: string | null
          discharge_date: string | null
          discharge_notes: string | null
          doctor_id: string
          id: string
          patient_id: string
          reason: string | null
          room_id: string
          service_id: string | null
          status: Database["public"]["Enums"]["hospitalization_status"]
          updated_at: string
        }
        Insert: {
          admission_date?: string
          bed_id: string
          consultation_id?: string | null
          created_at?: string
          created_by?: string | null
          discharge_date?: string | null
          discharge_notes?: string | null
          doctor_id: string
          id?: string
          patient_id: string
          reason?: string | null
          room_id: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["hospitalization_status"]
          updated_at?: string
        }
        Update: {
          admission_date?: string
          bed_id?: string
          consultation_id?: string | null
          created_at?: string
          created_by?: string | null
          discharge_date?: string | null
          discharge_notes?: string | null
          doctor_id?: string
          id?: string
          patient_id?: string
          reason?: string | null
          room_id?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["hospitalization_status"]
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          consultation_id: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          hospitalization_id: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_amount: number
          patient_id: string
          status: Database["public"]["Enums"]["invoice_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          hospitalization_id?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number
          patient_id: string
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          hospitalization_id?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number
          patient_id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          recipient_id: string
          related_patient_id: string | null
          sender_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          recipient_id: string
          related_patient_id?: string | null
          sender_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          recipient_id?: string
          related_patient_id?: string | null
          sender_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: []
      }
      nurses: {
        Row: {
          created_at: string
          id: string
          license_number: string | null
          profile_id: string
          service_id: string | null
          shift: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          license_number?: string | null
          profile_id: string
          service_id?: string | null
          shift?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          license_number?: string | null
          profile_id?: string
          service_id?: string | null
          shift?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          blood_type: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: string | null
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          last_name: string
          medical_notes: string | null
          phone: string | null
          primary_doctor_id: string | null
          status: Database["public"]["Enums"]["patient_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          blood_type?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender?: string | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          last_name: string
          medical_notes?: string | null
          phone?: string | null
          primary_doctor_id?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string | null
          blood_type?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          last_name?: string
          medical_notes?: string | null
          phone?: string | null
          primary_doctor_id?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          received_by: string | null
          reference_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          received_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          received_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          created_at: string
          floor: number | null
          id: string
          is_active: boolean
          room_number: string
          room_type: string | null
          service_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          floor?: number | null
          id?: string
          is_active?: boolean
          room_number: string
          room_type?: string | null
          service_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          floor?: number | null
          id?: string
          is_active?: boolean
          room_number?: string
          room_type?: string | null
          service_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          id: string
          is_active: boolean
          name: string
          name_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      treatments: {
        Row: {
          created_at: string
          hospitalization_id: string
          id: string
          medications: string
          notes: string | null
          nurse_id: string
          patient_id: string
          treatment_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hospitalization_id: string
          id?: string
          medications: string
          notes?: string | null
          nurse_id: string
          patient_id: string
          treatment_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hospitalization_id?: string
          id?: string
          medications?: string
          notes?: string | null
          nurse_id?: string
          patient_id?: string
          treatment_date?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      appointments_detail: {
        Row: {
          appointment_date: string | null
          appointment_time: string | null
          doctor_id: string | null
          doctor_name: string | null
          id: string | null
          patient_id: string | null
          patient_name: string | null
          service_id: string | null
          service_name: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
        }
      }
      hospitalizations_detail: {
        Row: {
          admission_date: string | null
          bed_id: string | null
          bed_number: number | null
          doctor_id: string | null
          doctor_name: string | null
          id: string | null
          patient_id: string | null
          patient_name: string | null
          room_id: string | null
          room_number: string | null
          service_name: string | null
          status: Database["public"]["Enums"]["hospitalization_status"] | null
        }
      }
      patients_with_doctor: {
        Row: {
          doctor_name: string | null
          doctor_record_id: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          primary_doctor_id: string | null
          specialization: string | null
          status: Database["public"]["Enums"]["patient_status"] | null
        }
      }
      rooms_with_beds: {
        Row: {
          available_beds: number | null
          id: string | null
          is_active: boolean | null
          occupied_beds: number | null
          room_number: string | null
          service_id: string | null
          service_name: string | null
          total_beds: number | null
        }
      }
    }
    Functions: {
      get_dashboard_stats: { Args: Record<string, never>; Returns: Json }
      get_doctor_stats: { Args: { p_doctor_id: string }; Returns: Json }
      get_monthly_revenue: { Args: Record<string, never>; Returns: Json }
      get_reception_stats: { Args: Record<string, never>; Returns: Json }
      get_user_role: { Args: Record<string, never>; Returns: Database["public"]["Enums"]["user_role"] }
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      ambulance_status: "pending" | "dispatched" | "en_route" | "completed" | "cancelled"
      appointment_status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show"
      bed_status: "available" | "occupied" | "maintenance"
      consultation_type: "initial" | "follow_up" | "emergency" | "routine"
      hospitalization_status: "waiting" | "hospitalized" | "discharged"
      invoice_status: "draft" | "pending" | "paid" | "partially_paid" | "overdue" | "cancelled"
      notification_type: "lab" | "radiology" | "appointment" | "hospitalization" | "system" | "billing"
      patient_status: "consultation" | "hospitalized" | "discharged" | "archived"
      payment_method: "cash" | "card" | "bank_transfer" | "insurance" | "cheque"
      user_role: "admin" | "doctor" | "nurse" | "reception" | "chef"
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]
export type Views<T extends keyof Database["public"]["Views"]> = Database["public"]["Views"][T]["Row"]
