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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          project_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      consulting_submissions: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          organization: string | null
          service_needed: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          organization?: string | null
          service_needed?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          organization?: string | null
          service_needed?: string | null
        }
        Relationships: []
      }
      copilot_conversations: {
        Row: {
          created_at: string
          id: string
          specialty: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          specialty?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          specialty?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      copilot_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copilot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "copilot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      epidemic_alerts: {
        Row: {
          case_count: number | null
          change_percent: number | null
          created_at: string
          description: string | null
          disease_category: string | null
          id: string
          is_active: boolean | null
          region: string
          resolved_at: string | null
          severity: string
          source: string | null
          title: string
          user_id: string
        }
        Insert: {
          case_count?: number | null
          change_percent?: number | null
          created_at?: string
          description?: string | null
          disease_category?: string | null
          id?: string
          is_active?: boolean | null
          region: string
          resolved_at?: string | null
          severity?: string
          source?: string | null
          title: string
          user_id: string
        }
        Update: {
          case_count?: number | null
          change_percent?: number | null
          created_at?: string
          description?: string | null
          disease_category?: string | null
          id?: string
          is_active?: boolean | null
          region?: string
          resolved_at?: string | null
          severity?: string
          source?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      epidemic_reports: {
        Row: {
          alert_count: number | null
          created_at: string
          disease_data: Json | null
          disease_filter: string | null
          full_analysis: string | null
          id: string
          regions: Json | null
          report_type: string
          summary: string | null
          time_range: string | null
          title: string
          total_cases: number | null
          trend_data: Json | null
          user_id: string
        }
        Insert: {
          alert_count?: number | null
          created_at?: string
          disease_data?: Json | null
          disease_filter?: string | null
          full_analysis?: string | null
          id?: string
          regions?: Json | null
          report_type?: string
          summary?: string | null
          time_range?: string | null
          title?: string
          total_cases?: number | null
          trend_data?: Json | null
          user_id: string
        }
        Update: {
          alert_count?: number | null
          created_at?: string
          disease_data?: Json | null
          disease_filter?: string | null
          full_analysis?: string | null
          id?: string
          regions?: Json | null
          report_type?: string
          summary?: string | null
          time_range?: string | null
          title?: string
          total_cases?: number | null
          trend_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          activity_email: boolean
          activity_inapp: boolean
          activity_toast: boolean
          billing_email: boolean
          billing_inapp: boolean
          billing_toast: boolean
          created_at: string
          id: string
          project_share_email: boolean
          project_share_inapp: boolean
          project_share_toast: boolean
          quiet_hours_enabled: boolean
          quiet_hours_end: string
          quiet_hours_start: string
          security_email: boolean
          security_inapp: boolean
          security_toast: boolean
          system_email: boolean
          system_inapp: boolean
          system_toast: boolean
          team_invite_email: boolean
          team_invite_inapp: boolean
          team_invite_toast: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_email?: boolean
          activity_inapp?: boolean
          activity_toast?: boolean
          billing_email?: boolean
          billing_inapp?: boolean
          billing_toast?: boolean
          created_at?: string
          id?: string
          project_share_email?: boolean
          project_share_inapp?: boolean
          project_share_toast?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          security_email?: boolean
          security_inapp?: boolean
          security_toast?: boolean
          system_email?: boolean
          system_inapp?: boolean
          system_toast?: boolean
          team_invite_email?: boolean
          team_invite_inapp?: boolean
          team_invite_toast?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_email?: boolean
          activity_inapp?: boolean
          activity_toast?: boolean
          billing_email?: boolean
          billing_inapp?: boolean
          billing_toast?: boolean
          created_at?: string
          id?: string
          project_share_email?: boolean
          project_share_inapp?: boolean
          project_share_toast?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          security_email?: boolean
          security_inapp?: boolean
          security_toast?: boolean
          system_email?: boolean
          system_inapp?: boolean
          system_toast?: boolean
          team_invite_email?: boolean
          team_invite_inapp?: boolean
          team_invite_toast?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_shares: {
        Row: {
          accepted: boolean
          can_analyze: boolean
          can_manage: boolean
          can_report: boolean
          can_upload: boolean
          can_view: boolean
          created_at: string
          id: string
          project_id: string
          shared_by: string
          shared_with_email: string
          shared_with_user_id: string | null
        }
        Insert: {
          accepted?: boolean
          can_analyze?: boolean
          can_manage?: boolean
          can_report?: boolean
          can_upload?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          project_id: string
          shared_by: string
          shared_with_email: string
          shared_with_user_id?: string | null
        }
        Update: {
          accepted?: boolean
          can_analyze?: boolean
          can_manage?: boolean
          can_report?: boolean
          can_upload?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          project_id?: string
          shared_by?: string
          shared_with_email?: string
          shared_with_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_shares_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      redaction_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redaction_audit_log_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "redaction_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      redaction_entities: {
        Row: {
          confidence: number
          created_at: string
          end_index: number | null
          entity_type: string
          id: string
          is_redacted: boolean | null
          job_id: string
          original_value: string
          redacted_value: string
          start_index: number | null
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          end_index?: number | null
          entity_type: string
          id?: string
          is_redacted?: boolean | null
          job_id: string
          original_value: string
          redacted_value: string
          start_index?: number | null
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          end_index?: number | null
          entity_type?: string
          id?: string
          is_redacted?: boolean | null
          job_id?: string
          original_value?: string
          redacted_value?: string
          start_index?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redaction_entities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "redaction_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      redaction_jobs: {
        Row: {
          avg_confidence: number | null
          completed_at: string | null
          created_at: string
          entity_count: number | null
          file_name: string
          file_size: number | null
          id: string
          original_text: string
          redacted_text: string | null
          specialty: string | null
          status: string
          user_id: string
        }
        Insert: {
          avg_confidence?: number | null
          completed_at?: string | null
          created_at?: string
          entity_count?: number | null
          file_name: string
          file_size?: number | null
          id?: string
          original_text: string
          redacted_text?: string | null
          specialty?: string | null
          status?: string
          user_id: string
        }
        Update: {
          avg_confidence?: number | null
          completed_at?: string | null
          created_at?: string
          entity_count?: number | null
          file_name?: string
          file_size?: number | null
          id?: string
          original_text?: string
          redacted_text?: string | null
          specialty?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          created_at: string
          id: string
          ip_allowlist: string[] | null
          login_alerts_enabled: boolean
          session_timeout_minutes: number
          two_factor_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_allowlist?: string[] | null
          login_alerts_enabled?: boolean
          session_timeout_minutes?: number
          two_factor_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_allowlist?: string[] | null
          login_alerts_enabled?: boolean
          session_timeout_minutes?: number
          two_factor_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          accepted: boolean
          created_at: string
          email: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          accepted?: boolean
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          accepted?: boolean
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trusted_devices: {
        Row: {
          browser: string | null
          created_at: string
          device_name: string
          id: string
          ip_address: string | null
          is_current: boolean
          last_active_at: string
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_name?: string
          id?: string
          ip_address?: string | null
          is_current?: boolean
          last_active_at?: string
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_name?: string
          id?: string
          ip_address?: string | null
          is_current?: boolean
          last_active_at?: string
          os?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_applications: {
        Row: {
          admin_notes: string | null
          company_name: string
          company_size: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          intended_use: string
          location: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          intended_use?: string
          location?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          intended_use?: string
          location?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_application_status: { Args: { _user_id: string }; Returns: string }
      has_project_share: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_project_owner: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_owner: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      team_role: "owner" | "admin" | "member" | "viewer"
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
      app_role: ["admin", "user"],
      team_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
