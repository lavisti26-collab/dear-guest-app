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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      guests: {
        Row: {
          created_at: string
          id: string
          name: string
          number_of_guests: number
          rsvp_status: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          number_of_guests?: number
          rsvp_status?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          number_of_guests?: number
          rsvp_status?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          created_at: string
          id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          url?: string
        }
        Relationships: []
      }
      program_schedule: {
        Row: {
          created_at: string
          id: string
          order_index: number
          time_en: string | null
          time_km: string | null
          title_en: string | null
          title_km: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_index?: number
          time_en?: string | null
          time_km?: string | null
          title_en?: string | null
          title_km?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          time_en?: string | null
          time_km?: string | null
          title_en?: string | null
          title_km?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          calendar_url: string | null
          contact_email: string | null
          contact_facebook: string | null
          contact_phone: string | null
          contact_telegram: string | null
          couple_names: string | null
          couple_names_km: string | null
          created_at: string
          gift_bank_account: string | null
          gift_bank_name: string | null
          gift_qr_code: string | null
          hero_image: string | null
          id: string
          map_embed_url: string | null
          map_lat: string | null
          map_lng: string | null
          music_file: string | null
          music_url: string | null
          updated_at: string
          venue: string | null
          venue_km: string | null
          wedding_date: string | null
          wedding_date_km: string | null
          wedding_date_time: string | null
          wedding_description: string | null
          wedding_description_km: string | null
          wedding_time: string | null
          wedding_time_km: string | null
        }
        Insert: {
          calendar_url?: string | null
          contact_email?: string | null
          contact_facebook?: string | null
          contact_phone?: string | null
          contact_telegram?: string | null
          couple_names?: string | null
          couple_names_km?: string | null
          created_at?: string
          gift_bank_account?: string | null
          gift_bank_name?: string | null
          gift_qr_code?: string | null
          hero_image?: string | null
          id?: string
          map_embed_url?: string | null
          map_lat?: string | null
          map_lng?: string | null
          music_file?: string | null
          music_url?: string | null
          updated_at?: string
          venue?: string | null
          venue_km?: string | null
          wedding_date?: string | null
          wedding_date_km?: string | null
          wedding_date_time?: string | null
          wedding_description?: string | null
          wedding_description_km?: string | null
          wedding_time?: string | null
          wedding_time_km?: string | null
        }
        Update: {
          calendar_url?: string | null
          contact_email?: string | null
          contact_facebook?: string | null
          contact_phone?: string | null
          contact_telegram?: string | null
          couple_names?: string | null
          couple_names_km?: string | null
          created_at?: string
          gift_bank_account?: string | null
          gift_bank_name?: string | null
          gift_qr_code?: string | null
          hero_image?: string | null
          id?: string
          map_embed_url?: string | null
          map_lat?: string | null
          map_lng?: string | null
          music_file?: string | null
          music_url?: string | null
          updated_at?: string
          venue?: string | null
          venue_km?: string | null
          wedding_date?: string | null
          wedding_date_km?: string | null
          wedding_date_time?: string | null
          wedding_description?: string | null
          wedding_description_km?: string | null
          wedding_time?: string | null
          wedding_time_km?: string | null
        }
        Relationships: []
      }
      wishes: {
        Row: {
          created_at: string
          guest_name: string
          id: string
          message: string | null
        }
        Insert: {
          created_at?: string
          guest_name: string
          id?: string
          message?: string | null
        }
        Update: {
          created_at?: string
          guest_name?: string
          id?: string
          message?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
