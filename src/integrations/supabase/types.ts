export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_intake_responses: {
        Row: {
          appointment_id: string | null
          conversation_data: Json
          created_at: string
          id: string
          is_reviewed_by_doctor: boolean | null
          patient_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          symptoms_summary: Json
          triage_priority: Database["public"]["Enums"]["triage_priority"]
          triage_rationale: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          conversation_data: Json
          created_at?: string
          id?: string
          is_reviewed_by_doctor?: boolean | null
          patient_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          symptoms_summary: Json
          triage_priority: Database["public"]["Enums"]["triage_priority"]
          triage_rationale: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          conversation_data?: Json
          created_at?: string
          id?: string
          is_reviewed_by_doctor?: boolean | null
          patient_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          symptoms_summary?: Json
          triage_priority?: Database["public"]["Enums"]["triage_priority"]
          triage_rationale?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_intake_responses_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_intake_responses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_intake_responses_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      appointments: {
        Row: {
          chief_complaint: string | null
          consultation_fee: number
          created_at: string
          doctor_id: string
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string
          prescription_id: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string
        }
        Insert: {
          chief_complaint?: string | null
          consultation_fee: number
          created_at?: string
          doctor_id: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          prescription_id?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string
        }
        Update: {
          chief_complaint?: string | null
          consultation_fee?: number
          created_at?: string
          doctor_id?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          prescription_id?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          appointment_id: string
          chat_transcript: Json | null
          created_at: string
          ended_at: string | null
          id: string
          recording_url: string | null
          room_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["consultation_status"] | null
          updated_at: string
        }
        Insert: {
          appointment_id: string
          chat_transcript?: Json | null
          created_at?: string
          ended_at?: string | null
          id?: string
          recording_url?: string | null
          room_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"] | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          chat_transcript?: Json | null
          created_at?: string
          ended_at?: string | null
          id?: string
          recording_url?: string | null
          room_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_availability: {
        Row: {
          created_at: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_availability_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          appointment_id: string | null
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          is_medical_record: boolean | null
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          is_medical_record?: boolean | null
          storage_path: string
          uploaded_by: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          is_medical_record?: boolean | null
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string
          currency: string | null
          doctor_id: string
          id: string
          paid_at: string | null
          patient_id: string
          payment_method: string | null
          payment_provider: string | null
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string
          currency?: string | null
          doctor_id: string
          id?: string
          paid_at?: string | null
          patient_id: string
          payment_method?: string | null
          payment_provider?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string
          currency?: string | null
          doctor_id?: string
          id?: string
          paid_at?: string | null
          patient_id?: string
          payment_method?: string | null
          payment_provider?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          ai_generated_draft: Json | null
          appointment_id: string
          created_at: string
          doctor_id: string
          doctor_signature: string | null
          id: string
          instructions: string | null
          is_ai_assisted: boolean | null
          is_signed: boolean | null
          medications: Json
          patient_id: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          ai_generated_draft?: Json | null
          appointment_id: string
          created_at?: string
          doctor_id: string
          doctor_signature?: string | null
          id?: string
          instructions?: string | null
          is_ai_assisted?: boolean | null
          is_signed?: boolean | null
          medications: Json
          patient_id: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          ai_generated_draft?: Json | null
          appointment_id?: string
          created_at?: string
          doctor_id?: string
          doctor_signature?: string | null
          id?: string
          instructions?: string | null
          is_ai_assisted?: boolean | null
          is_signed?: boolean | null
          medications?: Json
          patient_id?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          bio: string | null
          consultation_fee: number | null
          created_at: string
          date_of_birth: string | null
          emergency_contact: Json | null
          experience_years: number | null
          first_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_name: string
          medical_license_number: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: Json | null
          experience_years?: number | null
          first_name: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_name: string
          medical_license_number?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: Json | null
          experience_years?: number | null
          first_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_name?: string
          medical_license_number?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      soap_notes: {
        Row: {
          ai_generated_draft: Json | null
          appointment_id: string
          assessment: string | null
          created_at: string
          doctor_id: string
          id: string
          is_ai_assisted: boolean | null
          is_finalized: boolean | null
          objective: string | null
          plan: string | null
          subjective: string | null
          updated_at: string
        }
        Insert: {
          ai_generated_draft?: Json | null
          appointment_id: string
          assessment?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          is_ai_assisted?: boolean | null
          is_finalized?: boolean | null
          objective?: string | null
          plan?: string | null
          subjective?: string | null
          updated_at?: string
        }
        Update: {
          ai_generated_draft?: Json | null
          appointment_id?: string
          assessment?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          is_ai_assisted?: boolean | null
          is_finalized?: boolean | null
          objective?: string | null
          plan?: string | null
          subjective?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "soap_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "rescheduled"
      consultation_status: "waiting" | "active" | "completed" | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      triage_priority: "routine" | "urgent" | "emergency"
      user_role: "patient" | "doctor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      consultation_status: ["waiting", "active", "completed", "cancelled"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      triage_priority: ["routine", "urgent", "emergency"],
      user_role: ["patient", "doctor", "admin"],
    },
  },
} as const
