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
          attendance_status: string
          created_at: string
          dietary_notes: string | null
          guest_name: string
          id: string
          meal_preference: string | null
          note: string | null
          phone_number: string | null
          total_guests: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attendance_status?: string
          created_at?: string
          dietary_notes?: string | null
          guest_name: string
          id?: string
          meal_preference?: string | null
          note?: string | null
          phone_number?: string | null
          total_guests?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attendance_status?: string
          created_at?: string
          dietary_notes?: string | null
          guest_name?: string
          id?: string
          meal_preference?: string | null
          note?: string | null
          phone_number?: string | null
          total_guests?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string
          created_by: string | null
          id: string
          url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          background_music_url: string | null
          bank_qr_url: string | null
          bride_name: string | null
          created_at: string
          display_name: string | null
          email: string | null
          groom_name: string | null
          id: string
          is_super_admin: boolean
          account_status: string
          slug: string
          theme: string
          updated_at: string
          user_id: string
          visual_style: string
          wedding_date: string | null
        }
        Insert: {
          background_music_url?: string | null
          bank_qr_url?: string | null
          bride_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          groom_name?: string | null
          id?: string
          is_super_admin?: boolean
          account_status?: string
          slug: string
          theme?: string
          updated_at?: string
          user_id: string
          visual_style?: string
          wedding_date?: string | null
        }
        Update: {
          background_music_url?: string | null
          bank_qr_url?: string | null
          bride_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          groom_name?: string | null
          id?: string
          is_super_admin?: boolean
          slug?: string
          theme?: string
          updated_at?: string
          user_id?: string
          visual_style?: string
          wedding_date?: string | null
        }
        Relationships: []
      }
      program_schedule: {
        Row: {
          created_at: string
          event_time: string | null
          event_title: string | null
          id: string
          order_index: number
          time_en: string | null
          time_km: string | null
          title_en: string | null
          title_km: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_time?: string | null
          event_title?: string | null
          id?: string
          order_index?: number
          time_en?: string | null
          time_km?: string | null
          title_en?: string | null
          title_km?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_time?: string | null
          event_title?: string | null
          id?: string
          order_index?: number
          time_en?: string | null
          time_km?: string | null
          title_en?: string | null
          title_km?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          couple_names: string | null
          couple_names_km: string | null
          created_at: string
          created_by: string | null
          gift_account_name: string | null
          gift_account_number: string | null
          gift_bank_name: string | null
          gift_enabled: boolean
          gift_qr_url: string | null
          hero_image: string | null
          id: string
          music_file: string | null
          music_url: string | null
          updated_at: string
          user_id: string
          venue: string | null
          venue_maps: string | null
          wedding_date: string | null
        }
        Insert: {
          couple_names?: string | null
          couple_names_km?: string | null
          created_at?: string
          created_by?: string | null
          gift_account_name?: string | null
          gift_account_number?: string | null
          gift_bank_name?: string | null
          gift_enabled?: boolean
          gift_qr_url?: string | null
          hero_image?: string | null
          id?: string
          music_file?: string | null
          music_url?: string | null
          updated_at?: string
          user_id: string
          venue?: string | null
          venue_maps?: string | null
          wedding_date?: string | null
        }
        Update: {
          couple_names?: string | null
          couple_names_km?: string | null
          created_at?: string
          created_by?: string | null
          gift_account_name?: string | null
          gift_account_number?: string | null
          gift_bank_name?: string | null
          gift_enabled?: boolean
          gift_qr_url?: string | null
          hero_image?: string | null
          id?: string
          music_file?: string | null
          music_url?: string | null
          updated_at?: string
          user_id?: string
          venue?: string | null
          venue_maps?: string | null
          wedding_date?: string | null
        }
        Relationships: []
      }
      wishes: {
        Row: {
          created_at: string
          guest_name: string
          id: string
          user_id: string
          wish_message: string
        }
        Insert: {
          created_at?: string
          guest_name: string
          id?: string
          user_id: string
          wish_message: string
        }
        Update: {
          created_at?: string
          guest_name?: string
          id?: string
          user_id?: string
          wish_message?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          id: string | null
          user_id: string | null
          slug: string | null
          display_name: string | null
          groom_name: string | null
          bride_name: string | null
          wedding_date: string | null
          theme: string | null
          background_music_url: string | null
          bank_qr_url: string | null
        }
        Insert: {
          id?: string | null
          user_id?: string | null
          slug?: string | null
          display_name?: string | null
          groom_name?: string | null
          bride_name?: string | null
          wedding_date?: string | null
          theme?: string | null
          background_music_url?: string | null
          bank_qr_url?: string | null
        }
        Update: {
          id?: string | null
          user_id?: string | null
          slug?: string | null
          display_name?: string | null
          groom_name?: string | null
          bride_name?: string | null
          wedding_date?: string | null
          theme?: string | null
          background_music_url?: string | null
          bank_qr_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_public_profile_by_slug: {
        Args: { p_slug: string }
        Returns: {
          id: string
          user_id: string
          slug: string
          email: string | null
          display_name: string | null
          groom_name: string | null
          bride_name: string | null
          wedding_date: string | null
          theme: string
          background_music_url: string | null
          bank_qr_url: string | null
          is_super_admin: boolean
        }[]
      }
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
