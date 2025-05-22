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
      gallery_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          sequence: number | null
          src: string
          theme_id: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          sequence?: number | null
          src: string
          theme_id: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          sequence?: number | null
          src?: string
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "gallery_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_themes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      model_applications: {
        Row: {
          age: number | null
          availability: string | null
          bust: number | null
          category_id: string
          created_at: string
          date_of_birth: string | null
          email: string
          experience: string | null
          eye_color: string | null
          first_name: string
          gender: string
          hair_color: string | null
          height: number
          hips: number | null
          id: string
          instagram_url: string | null
          last_name: string
          phone: string
          shoe_size: number | null
          updated_at: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          availability?: string | null
          bust?: number | null
          category_id: string
          created_at?: string
          date_of_birth?: string | null
          email: string
          experience?: string | null
          eye_color?: string | null
          first_name: string
          gender: string
          hair_color?: string | null
          height: number
          hips?: number | null
          id?: string
          instagram_url?: string | null
          last_name: string
          phone: string
          shoe_size?: number | null
          updated_at?: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          availability?: string | null
          bust?: number | null
          category_id?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string
          experience?: string | null
          eye_color?: string | null
          first_name?: string
          gender?: string
          hair_color?: string | null
          height?: number
          hips?: number | null
          id?: string
          instagram_url?: string | null
          last_name?: string
          phone?: string
          shoe_size?: number | null
          updated_at?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      model_events: {
        Row: {
          application_id: string
          created_at: string
          event_name: string
          id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          event_name: string
          id?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          event_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "model_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      model_languages: {
        Row: {
          application_id: string
          created_at: string
          id: string
          language: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          language: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          language?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_languages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "model_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      model_skills: {
        Row: {
          application_id: string
          created_at: string
          id: string
          skill: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          skill: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_skills_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "model_applications"
            referencedColumns: ["id"]
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
