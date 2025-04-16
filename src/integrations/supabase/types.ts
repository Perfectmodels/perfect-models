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
      app_users: {
        Row: {
          city: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          model_type: string | null
          password: string
          phone: string | null
          user_type: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          model_type?: string | null
          password: string
          phone?: string | null
          user_type: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          model_type?: string | null
          password?: string
          phone?: string | null
          user_type?: string
        }
        Relationships: []
      }
      biodiversity: {
        Row: {
          category: string
          conservation_status: string | null
          created_at: string
          description: string
          habitat: string | null
          id: string
          image_url: string
          name: string
          scientific_name: string | null
        }
        Insert: {
          category: string
          conservation_status?: string | null
          created_at?: string
          description: string
          habitat?: string | null
          id?: string
          image_url: string
          name: string
          scientific_name?: string | null
        }
        Update: {
          category?: string
          conservation_status?: string | null
          created_at?: string
          description?: string
          habitat?: string | null
          id?: string
          image_url?: string
          name?: string
          scientific_name?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          country_id: number | null
          id: number
          name: string
        }
        Insert: {
          country_id?: number | null
          id?: number
          name: string
        }
        Update: {
          country_id?: number | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      cosmetic_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      cosmetics: {
        Row: {
          brand: string | null
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cosmetics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "cosmetic_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          id: number
          name: string
        }
        Insert: {
          code: string
          id?: number
          name: string
        }
        Update: {
          code?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      destinations: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string
          name: string
          popularity: number | null
          province_id: string | null
          visit_season: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location: string
          name: string
          popularity?: number | null
          province_id?: string | null
          visit_season?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string
          name?: string
          popularity?: number | null
          province_id?: string | null
          visit_season?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destinations_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          data_url: string
          id: string
          name: string
          size: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_url: string
          id?: string
          name: string
          size: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_url?: string
          id?: string
          name?: string
          size?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      editions: {
        Row: {
          created_at: string
          description: string
          end_date: string
          id: string
          start_date: string
          status: string
          theme: string
          title: string
          year: number
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          id?: string
          start_date: string
          status: string
          theme: string
          title: string
          year: number
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          theme?: string
          title?: string
          year?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string
          edition_id: string
          event_date: string
          id: string
          location: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          edition_id: string
          event_date: string
          id?: string
          location: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          edition_id?: string
          event_date?: string
          id?: string
          location?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string | null
          duration: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          price: number | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          price?: number | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          price?: number | null
          title?: string
        }
        Relationships: []
      }
      gabonese_cuisine: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string | null
          id: string
          image_url: string | null
          ingredients: string[]
          name: string
          preparation: string | null
          preparation_time: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients: string[]
          name: string
          preparation?: string | null
          preparation_time?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[]
          name?: string
          preparation?: string | null
          preparation_time?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          created_at: string
          description: string | null
          edition_id: string
          id: string
          image_url: string
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          edition_id: string
          id?: string
          image_url: string
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          edition_id?: string
          id?: string
          image_url?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string
          data_url: string
          description: string | null
          format: string
          id: string
          thumbnail_url: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_url: string
          description?: string | null
          format: string
          id?: string
          thumbnail_url?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_url?: string
          description?: string | null
          format?: string
          id?: string
          thumbnail_url?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_prescription_required: boolean
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_prescription_required?: boolean
          name: string
          price: number
          stock?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_prescription_required?: boolean
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "medication_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      model_applications: {
        Row: {
          city: string | null
          created_at: string | null
          email: string
          experience: string | null
          first_name: string
          height: number | null
          id: string
          last_name: string
          message: string | null
          phone: string
          portfolio_url: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          email: string
          experience?: string | null
          first_name: string
          height?: number | null
          id?: string
          last_name: string
          message?: string | null
          phone: string
          portfolio_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          email?: string
          experience?: string | null
          first_name?: string
          height?: number | null
          id?: string
          last_name?: string
          message?: string | null
          phone?: string
          portfolio_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          publication_date: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          publication_date?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          publication_date?: string
          title?: string
        }
        Relationships: []
      }
      news_feed: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nocturne_locations: {
        Row: {
          best_time: string | null
          created_at: string
          description: string
          full_description: string | null
          fun_facts: string[] | null
          id: string
          images: string[] | null
          location: string | null
          main_image: string | null
          scientific_name: string | null
          title: string
        }
        Insert: {
          best_time?: string | null
          created_at?: string
          description: string
          full_description?: string | null
          fun_facts?: string[] | null
          id?: string
          images?: string[] | null
          location?: string | null
          main_image?: string | null
          scientific_name?: string | null
          title: string
        }
        Update: {
          best_time?: string | null
          created_at?: string
          description?: string
          full_description?: string | null
          fun_facts?: string[] | null
          id?: string
          images?: string[] | null
          location?: string | null
          main_image?: string | null
          scientific_name?: string | null
          title?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          logo_url: string | null
          name: string
          website_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          logo_url?: string | null
          name: string
          website_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          logo_url?: string | null
          name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      pharmacist_advices: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          is_public: boolean
          question: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          question: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          question?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pharmacists: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          qualification: string
          speciality: string | null
          user_id: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          qualification: string
          speciality?: string | null
          user_id?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          qualification?: string
          speciality?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_pharmacy: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_pharmacy?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_pharmacy?: boolean
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cover_photo_url: string | null
          created_at: string | null
          email: string | null
          experience: string | null
          eye_color: string | null
          hair_color: string | null
          height: number | null
          id: string
          measurements: string | null
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          eye_color?: string | null
          hair_color?: string | null
          height?: number | null
          id: string
          measurements?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          eye_color?: string | null
          hair_color?: string | null
          height?: number | null
          id?: string
          measurements?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          capital: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          capital?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          capital?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          comments: number | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          likes: number | null
          shares: number | null
          user_id: string | null
        }
        Insert: {
          comments?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          shares?: number | null
          user_id?: string | null
        }
        Update: {
          comments?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          shares?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          duration: string
          features: string[]
          id: string
          is_popular: boolean | null
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          duration: string
          features: string[]
          id?: string
          is_popular?: boolean | null
          name: string
          price: number
        }
        Update: {
          created_at?: string
          duration?: string
          features?: string[]
          id?: string
          is_popular?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      traditional_tales: {
        Row: {
          created_at: string
          description: string
          ethnicity: string
          id: string
          image_url: string | null
          moral: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          ethnicity: string
          id?: string
          image_url?: string | null
          moral?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          ethnicity?: string
          id?: string
          image_url?: string | null
          moral?: string | null
          title?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          payment_status: string | null
          plan_id: string | null
          start_date: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          payment_status?: string | null
          plan_id?: string | null
          start_date?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          payment_status?: string | null
          plan_id?: string | null
          start_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_tours: {
        Row: {
          created_at: string
          description: string
          destination_id: string | null
          id: string
          thumbnail_url: string | null
          title: string
          tour_url: string
        }
        Insert: {
          created_at?: string
          description: string
          destination_id?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
          tour_url: string
        }
        Update: {
          created_at?: string
          description?: string
          destination_id?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          tour_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "virtual_tours_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
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
