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
      agency_settings: {
        Row: {
          about_text: string | null
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          name: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          about_text?: string | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          age: number | null
          bust: number | null
          created_at: string
          date_of_birth: string | null
          email: string
          experience: string | null
          first_name: string
          gender: string
          height: number
          hips: number | null
          id: string
          image_front_url: string | null
          image_full_url: string | null
          image_side_url: string | null
          instagram_url: string | null
          last_name: string
          notes: string | null
          phone: string
          status: string | null
          updated_at: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          bust?: number | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          experience?: string | null
          first_name: string
          gender: string
          height: number
          hips?: number | null
          id?: string
          image_front_url?: string | null
          image_full_url?: string | null
          image_side_url?: string | null
          instagram_url?: string | null
          last_name: string
          notes?: string | null
          phone: string
          status?: string | null
          updated_at?: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          bust?: number | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          experience?: string | null
          first_name?: string
          gender?: string
          height?: number
          hips?: number | null
          id?: string
          image_front_url?: string | null
          image_full_url?: string | null
          image_side_url?: string | null
          instagram_url?: string | null
          last_name?: string
          notes?: string | null
          phone?: string
          status?: string | null
          updated_at?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      model_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      model_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_polaroid: boolean | null
          is_profile: boolean | null
          model_id: string
          order_number: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_polaroid?: boolean | null
          is_profile?: boolean | null
          model_id: string
          order_number?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_polaroid?: boolean | null
          is_profile?: boolean | null
          model_id?: string
          order_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "model_images_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          bust: number | null
          category_id: string | null
          created_at: string
          date_of_birth: string | null
          eye_color: string | null
          first_name: string
          gender: string
          hair_color: string | null
          height: number
          hips: number | null
          id: string
          instagram_url: string | null
          is_featured: boolean | null
          last_name: string
          nationality: string | null
          shoe_size: number | null
          updated_at: string
          waist: number | null
        }
        Insert: {
          bust?: number | null
          category_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          eye_color?: string | null
          first_name: string
          gender: string
          hair_color?: string | null
          height: number
          hips?: number | null
          id?: string
          instagram_url?: string | null
          is_featured?: boolean | null
          last_name: string
          nationality?: string | null
          shoe_size?: number | null
          updated_at?: string
          waist?: number | null
        }
        Update: {
          bust?: number | null
          category_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          eye_color?: string | null
          first_name?: string
          gender?: string
          hair_color?: string | null
          height?: number
          hips?: number | null
          id?: string
          instagram_url?: string | null
          is_featured?: boolean | null
          last_name?: string
          nationality?: string | null
          shoe_size?: number | null
          updated_at?: string
          waist?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "models_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "model_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          published_at: string
          slug: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string
          slug: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          image_url: string | null
          last_name: string
          order_number: number | null
          position: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          image_url?: string | null
          last_name: string
          order_number?: number | null
          position: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          image_url?: string | null
          last_name?: string
          order_number?: number | null
          position?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      disable_realtime_for_table: {
        Args: { table_name: string }
        Returns: undefined
      }
      enable_realtime_for_table: {
        Args: { table_name: string }
        Returns: undefined
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
