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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      absences: {
        Row: {
          created_at: string
          event_date: string
          id: string
          legacy_id: string | null
          model_id: string
          notes: string | null
          raw_data: Json
          reason: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          legacy_id?: string | null
          model_id: string
          notes?: string | null
          raw_data?: Json
          reason?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          legacy_id?: string | null
          model_id?: string
          notes?: string | null
          raw_data?: Json
          reason?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "absences_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absences_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "public_models"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          permission_key: string
          updated_at: string
          value: Json
        }
        Insert: {
          permission_key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          permission_key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      admin_profile_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      agency_achievements_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      agency_info_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      agency_partners_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      agency_timeline: {
        Row: {
          event: string
          id: string
          position: number
          year: string
        }
        Insert: {
          event: string
          id?: string
          position?: number
          year: string
        }
        Update: {
          event?: string
          id?: string
          position?: number
          year?: string
        }
        Relationships: []
      }
      app_collections: {
        Row: {
          key: string
          payload: Json | null
          updated_at: string
        }
        Insert: {
          key: string
          payload?: Json | null
          updated_at?: string
        }
        Update: {
          key?: string
          payload?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      applications_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      article_comments: {
        Row: {
          author_name: string | null
          body: string
          created_at: string
          id: string
          legacy_id: string | null
          legacy_post_id: string | null
          legacy_user_id: string | null
          post_id: string | null
          raw_data: Json
          status: string
          user_id: string | null
        }
        Insert: {
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          legacy_id?: string | null
          legacy_post_id?: string | null
          legacy_user_id?: string | null
          post_id?: string | null
          raw_data?: Json
          status?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          legacy_id?: string | null
          legacy_post_id?: string | null
          legacy_user_id?: string | null
          post_id?: string | null
          raw_data?: Json
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_migration_map: {
        Row: {
          created_at: string
          data: Json
          email: string
          firebase_uid: string
          migrated_at: string | null
          must_change_password: boolean
          profile_id: string | null
          role: string | null
          supabase_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          email: string
          firebase_uid: string
          migrated_at?: string | null
          must_change_password?: boolean
          profile_id?: string | null
          role?: string | null
          supabase_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          email?: string
          firebase_uid?: string
          migrated_at?: string | null
          must_change_password?: boolean
          profile_id?: string | null
          role?: string | null
          supabase_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      beauty_contests: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          legacy_id: string | null
          name: string
          raw_data: Json
          status: string | null
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          legacy_id?: string | null
          name: string
          raw_data?: Json
          status?: string | null
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          legacy_id?: string | null
          name?: string
          raw_data?: Json
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string | null
          category: string | null
          content: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          legacy_id: string | null
          published_at: string | null
          raw_data: Json
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          legacy_id?: string | null
          published_at?: string | null
          raw_data?: Json
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          legacy_id?: string | null
          published_at?: string | null
          raw_data?: Json
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          legacy_id: string | null
          model_id: string | null
          name: string | null
          phone: string | null
          raw_data: Json
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          legacy_id?: string | null
          model_id?: string | null
          name?: string | null
          phone?: string | null
          raw_data?: Json
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          legacy_id?: string | null
          model_id?: string | null
          name?: string | null
          phone?: string | null
          raw_data?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "public_models"
            referencedColumns: ["id"]
          },
        ]
      }
      casting_applications: {
        Row: {
          account_provisioned_at: string | null
          age: number | null
          birth_date: string | null
          city: string | null
          created_at: string
          credentials_email_status: string | null
          email: string | null
          experience: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          last_name: string | null
          legacy_id: string | null
          measurements: Json
          notes: string | null
          phone: string | null
          photos: Json
          raw_data: Json
          status: string
          updated_at: string
        }
        Insert: {
          account_provisioned_at?: string | null
          age?: number | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          credentials_email_status?: string | null
          email?: string | null
          experience?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          legacy_id?: string | null
          measurements?: Json
          notes?: string | null
          phone?: string | null
          photos?: Json
          raw_data?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          account_provisioned_at?: string | null
          age?: number | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          credentials_email_status?: string | null
          email?: string | null
          experience?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          legacy_id?: string | null
          measurements?: Json
          notes?: string | null
          phone?: string | null
          photos?: Json
          raw_data?: Json
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      classroom_messages: {
        Row: {
          body: string | null
          created_at: string
          direction: string
          id: string
          legacy_id: string | null
          legacy_user_id: string | null
          model_id: string | null
          raw_data: Json
          status: string | null
          subject: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          direction?: string
          id?: string
          legacy_id?: string | null
          legacy_user_id?: string | null
          model_id?: string | null
          raw_data?: Json
          status?: string | null
          subject?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          direction?: string
          id?: string
          legacy_id?: string | null
          legacy_user_id?: string | null
          model_id?: string | null
          raw_data?: Json
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      classroom_requests: {
        Row: {
          created_at: string
          id: string
          legacy_id: string | null
          legacy_user_id: string | null
          message: string | null
          model_id: string | null
          raw_data: Json
          request_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          legacy_id?: string | null
          legacy_user_id?: string | null
          message?: string | null
          model_id?: string | null
          raw_data?: Json
          request_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          legacy_id?: string | null
          legacy_user_id?: string | null
          message?: string | null
          model_id?: string | null
          raw_data?: Json
          request_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_info_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          id: string
          legacy_id: string | null
          message: string | null
          name: string | null
          phone: string | null
          raw_data: Json
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          legacy_id?: string | null
          message?: string | null
          name?: string | null
          phone?: string | null
          raw_data?: Json
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          legacy_id?: string | null
          message?: string | null
          name?: string | null
          phone?: string | null
          raw_data?: Json
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          id: string
          legacy_id: string | null
          legacy_user_id: string | null
          progress: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          id?: string
          legacy_id?: string | null
          legacy_user_id?: string | null
          progress?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          id?: string
          legacy_id?: string | null
          legacy_user_id?: string | null
          progress?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          content: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          description?: string | null
          id: string
          is_active?: boolean
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_delivery_log: {
        Row: {
          attempt_count: number
          created_at: string
          error_message: string | null
          id: string
          idempotency_key: string | null
          last_attempt_at: string
          metadata: Json
          provider: string
          provider_message_id: string | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string
          subject: string
          template_key: string | null
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          last_attempt_at?: string
          metadata?: Json
          provider?: string
          provider_message_id?: string | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status: string
          subject: string
          template_key?: string | null
        }
        Update: {
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          last_attempt_at?: string
          metadata?: Json
          provider?: string
          provider_message_id?: string | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_key?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string
          created_at: string
          html_content: string
          id: string
          is_active: boolean
          preheader: string | null
          subject: string
          template_key: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          html_content: string
          id?: string
          is_active?: boolean
          preheader?: string | null
          subject: string
          template_key: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          html_content?: string
          id?: string
          is_active?: boolean
          preheader?: string | null
          subject?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      entities: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          entity_type: string
          id: string
          logo_url: string | null
          metadata: Json
          normalized_name: string
          social_links: Json
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          entity_type: string
          id?: string
          logo_url?: string | null
          metadata?: Json
          normalized_name: string
          social_links?: Json
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          entity_type?: string
          id?: string
          logo_url?: string | null
          metadata?: Json
          normalized_name?: string
          social_links?: Json
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      faq_data_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      fashion_day_applications: {
        Row: {
          applicant_name: string | null
          application_type: string | null
          created_at: string
          email: string | null
          id: string
          legacy_id: string | null
          phone: string | null
          raw_data: Json
          status: string
          updated_at: string
        }
        Insert: {
          applicant_name?: string | null
          application_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          legacy_id?: string | null
          phone?: string | null
          raw_data?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_name?: string | null
          application_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          legacy_id?: string | null
          phone?: string | null
          raw_data?: Json
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      fashion_day_entity_mentions: {
        Row: {
          description: string | null
          entity_id: string
          event_id: string
          id: string
          images: Json
          metadata: Json
          role: string
        }
        Insert: {
          description?: string | null
          entity_id: string
          event_id: string
          id?: string
          images?: Json
          metadata?: Json
          role: string
        }
        Update: {
          description?: string | null
          entity_id?: string
          event_id?: string
          id?: string
          images?: Json
          metadata?: Json
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "fashion_day_entity_mentions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fashion_day_entity_mentions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "fashion_day_events"
            referencedColumns: ["id"]
          },
        ]
      }
      fashion_day_events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          edition: number
          event_date: string | null
          gallery_images: Json
          id: string
          location: string | null
          mc: string | null
          promoter: string | null
          raw_data: Json
          theme: string | null
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          edition: number
          event_date?: string | null
          gallery_images?: Json
          id?: string
          location?: string | null
          mc?: string | null
          promoter?: string | null
          raw_data?: Json
          theme?: string | null
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          edition?: number
          event_date?: string | null
          gallery_images?: Json
          id?: string
          location?: string | null
          mc?: string | null
          promoter?: string | null
          raw_data?: Json
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fashion_day_reservations: {
        Row: {
          email: string | null
          id: string
          name: string | null
          phone: string | null
          raw_data: Json
          special_requests: string | null
          status: string
          submitted_at: string | null
          table_option_id: string | null
        }
        Insert: {
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          raw_data?: Json
          special_requests?: string | null
          status?: string
          submitted_at?: string | null
          table_option_id?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          raw_data?: Json
          special_requests?: string | null
          status?: string
          submitted_at?: string | null
          table_option_id?: string | null
        }
        Relationships: []
      }
      fashion_day_reservations_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          author_user_id: string | null
          body: string | null
          created_at: string
          id: string
          legacy_author_id: string | null
          legacy_id: string | null
          legacy_thread_id: string | null
          raw_data: Json
          thread_id: string | null
        }
        Insert: {
          author_user_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          legacy_author_id?: string | null
          legacy_id?: string | null
          legacy_thread_id?: string | null
          raw_data?: Json
          thread_id?: string | null
        }
        Update: {
          author_user_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          legacy_author_id?: string | null
          legacy_id?: string | null
          legacy_thread_id?: string | null
          raw_data?: Json
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          author_user_id: string | null
          body: string | null
          created_at: string
          id: string
          legacy_author_id: string | null
          legacy_id: string | null
          raw_data: Json
          status: string
          title: string | null
        }
        Insert: {
          author_user_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          legacy_author_id?: string | null
          legacy_id?: string | null
          raw_data?: Json
          status?: string
          title?: string | null
        }
        Update: {
          author_user_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          legacy_author_id?: string | null
          legacy_id?: string | null
          raw_data?: Json
          status?: string
          title?: string | null
        }
        Relationships: []
      }
      general_applications: {
        Row: {
          age: number | null
          created_at: string
          email: string | null
          full_name: string | null
          height: string | null
          id: string
          location: string | null
          message: string | null
          phone: string | null
          raw_data: Json
          status: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          height?: string | null
          id: string
          location?: string | null
          message?: string | null
          phone?: string | null
          raw_data?: Json
          status?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          height?: string | null
          id?: string
          location?: string | null
          message?: string | null
          phone?: string | null
          raw_data?: Json
          status?: string
        }
        Relationships: []
      }
      hero_slides_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      jury_members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          legacy_id: string | null
          legacy_user_id: string | null
          name: string | null
          permissions: Json
          phone: string | null
          raw_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          legacy_id?: string | null
          legacy_user_id?: string | null
          name?: string | null
          permissions?: Json
          phone?: string | null
          raw_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          legacy_id?: string | null
          legacy_user_id?: string | null
          name?: string | null
          permissions?: Json
          phone?: string | null
          raw_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      legacy_firebase_collections: {
        Row: {
          collection_name: string
          migrated_at: string
          payload: Json | null
          source: string
        }
        Insert: {
          collection_name: string
          migrated_at?: string
          payload?: Json | null
          source?: string
        }
        Update: {
          collection_name?: string
          migrated_at?: string
          payload?: Json | null
          source?: string
        }
        Relationships: []
      }
      legacy_user_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          identifier: string | null
          is_active: boolean
          legacy_uid: string
          metadata: Json
          model_id: string | null
          must_change_password: boolean
          permissions: Json
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          identifier?: string | null
          is_active?: boolean
          legacy_uid: string
          metadata?: Json
          model_id?: string | null
          must_change_password?: boolean
          permissions?: Json
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          identifier?: string | null
          is_active?: boolean
          legacy_uid?: string
          metadata?: Json
          model_id?: string | null
          must_change_password?: boolean
          permissions?: Json
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mailing_contacts: {
        Row: {
          category: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          raw_data: Json
        }
        Insert: {
          category?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          raw_data?: Json
        }
        Update: {
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          raw_data?: Json
        }
        Relationships: []
      }
      mailing_contacts_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string
          file_name: string | null
          id: string
          metadata: Json
          mime_type: string | null
          pathname: string | null
          provider: string
          provider_key: string | null
          size_bytes: number | null
          source: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          pathname?: string | null
          provider?: string
          provider_key?: string | null
          size_bytes?: number | null
          source?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          pathname?: string | null
          provider?: string
          provider_key?: string | null
          size_bytes?: number | null
          source?: string | null
          url?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string | null
          channel: string
          created_at: string
          direction: string
          id: string
          legacy_id: string | null
          metadata: Json
          model_id: string | null
          provider_message_id: string | null
          recipient: string | null
          sender: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          body?: string | null
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          legacy_id?: string | null
          metadata?: Json
          model_id?: string | null
          provider_message_id?: string | null
          recipient?: string | null
          sender?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          legacy_id?: string | null
          metadata?: Json
          model_id?: string | null
          provider_message_id?: string | null
          recipient?: string | null
          sender?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "public_models"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_runs: {
        Row: {
          completed_at: string | null
          error: string | null
          id: string
          source: string
          started_at: string
          status: string
          summary: Json
        }
        Insert: {
          completed_at?: string | null
          error?: string | null
          id?: string
          source: string
          started_at?: string
          status?: string
          summary?: Json
        }
        Update: {
          completed_at?: string | null
          error?: string | null
          id?: string
          source?: string
          started_at?: string
          status?: string
          summary?: Json
        }
        Relationships: []
      }
      miss_one_light_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      model_account_claims: {
        Row: {
          activated_at: string | null
          activation_email_status: string | null
          agency_identifier: string
          auth_user_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          metadata: Json
          model_id: string
          phone: string | null
          status: string
          updated_at: string
          verification_method: string
        }
        Insert: {
          activated_at?: string | null
          activation_email_status?: string | null
          agency_identifier: string
          auth_user_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          metadata?: Json
          model_id: string
          phone?: string | null
          status?: string
          updated_at?: string
          verification_method?: string
        }
        Update: {
          activated_at?: string | null
          activation_email_status?: string | null
          agency_identifier?: string
          auth_user_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          metadata?: Json
          model_id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          verification_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_account_claims_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: true
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_account_claims_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: true
            referencedRelation: "public_models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_collaborations: {
        Row: {
          collaboration_date: string | null
          collaboration_type: string | null
          collaborator_name: string
          created_at: string
          date_label: string | null
          description: string | null
          id: string
          images: Json
          is_public: boolean
          location: string | null
          model_id: string
          position: number
          project_title: string | null
          updated_at: string
        }
        Insert: {
          collaboration_date?: string | null
          collaboration_type?: string | null
          collaborator_name: string
          created_at?: string
          date_label?: string | null
          description?: string | null
          id?: string
          images?: Json
          is_public?: boolean
          location?: string | null
          model_id: string
          position?: number
          project_title?: string | null
          updated_at?: string
        }
        Update: {
          collaboration_date?: string | null
          collaboration_type?: string | null
          collaborator_name?: string
          created_at?: string
          date_label?: string | null
          description?: string | null
          id?: string
          images?: Json
          is_public?: boolean
          location?: string | null
          model_id?: string
          position?: number
          project_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_collaborations_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_collaborations_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "public_models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_distinctions_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      model_events: {
        Row: {
          created_at: string
          date_label: string | null
          description: string | null
          designer: string | null
          event_date: string | null
          event_type: string | null
          id: string
          images: Json
          is_public: boolean
          location: string | null
          model_id: string
          name: string
          organizer: string | null
          position: number
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_label?: string | null
          description?: string | null
          designer?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          images?: Json
          is_public?: boolean
          location?: string | null
          model_id: string
          name: string
          organizer?: string | null
          position?: number
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_label?: string | null
          description?: string | null
          designer?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          images?: Json
          is_public?: boolean
          location?: string | null
          model_id?: string
          name?: string
          organizer?: string | null
          position?: number
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_events_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_events_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "public_models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_portfolio_images: {
        Row: {
          caption: string | null
          id: string
          model_id: string
          position: number
          url: string
        }
        Insert: {
          caption?: string | null
          id?: string
          model_id: string
          position?: number
          url: string
        }
        Update: {
          caption?: string | null
          id?: string
          model_id?: string
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_portfolio_images_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_portfolio_images_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "public_models"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          age: number | null
          auth_user_id: string | null
          birth_date: string | null
          casting_application_id: string | null
          categories: string[]
          created_at: string
          distinctions: Json
          email: string | null
          experience: string | null
          fashion_day_editions: number[]
          gender: string | null
          height: string | null
          id: string
          image_url: string | null
          instagram_url: string | null
          is_active: boolean
          is_public: boolean
          journey: string | null
          legacy_firebase_uid: string | null
          level: string | null
          location: string | null
          measurements: Json
          name: string
          nationality: string | null
          onboarding_completed_at: string | null
          permissions: Json
          phone: string | null
          quiz_scores: Json
          raw_data: Json
          status: string
          updated_at: string
          username: string | null
        }
        Insert: {
          age?: number | null
          auth_user_id?: string | null
          birth_date?: string | null
          casting_application_id?: string | null
          categories?: string[]
          created_at?: string
          distinctions?: Json
          email?: string | null
          experience?: string | null
          fashion_day_editions?: number[]
          gender?: string | null
          height?: string | null
          id: string
          image_url?: string | null
          instagram_url?: string | null
          is_active?: boolean
          is_public?: boolean
          journey?: string | null
          legacy_firebase_uid?: string | null
          level?: string | null
          location?: string | null
          measurements?: Json
          name: string
          nationality?: string | null
          onboarding_completed_at?: string | null
          permissions?: Json
          phone?: string | null
          quiz_scores?: Json
          raw_data?: Json
          status?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          age?: number | null
          auth_user_id?: string | null
          birth_date?: string | null
          casting_application_id?: string | null
          categories?: string[]
          created_at?: string
          distinctions?: Json
          email?: string | null
          experience?: string | null
          fashion_day_editions?: number[]
          gender?: string | null
          height?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_active?: boolean
          is_public?: boolean
          journey?: string | null
          legacy_firebase_uid?: string | null
          level?: string | null
          location?: string | null
          measurements?: Json
          name?: string
          nationality?: string | null
          onboarding_completed_at?: string | null
          permissions?: Json
          phone?: string | null
          quiz_scores?: Json
          raw_data?: Json
          status?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "models_casting_application_id_fkey"
            columns: ["casting_application_id"]
            isOneToOne: false
            referencedRelation: "casting_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_payments: {
        Row: {
          amount: number | null
          created_at: string
          currency: string
          id: string
          legacy_id: string | null
          model_id: string
          paid_at: string | null
          period: string
          raw_data: Json
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          legacy_id?: string | null
          model_id: string
          paid_at?: string | null
          period: string
          raw_data?: Json
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          legacy_id?: string | null
          model_id?: string
          paid_at?: string | null
          period?: string
          raw_data?: Json
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_payments_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_payments_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "public_models"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_items: {
        Row: {
          id: string
          in_footer: boolean
          is_active: boolean
          label: string
          path: string
          position: number
        }
        Insert: {
          id?: string
          in_footer?: boolean
          is_active?: boolean
          label: string
          path: string
          position?: number
        }
        Update: {
          id?: string
          in_footer?: boolean
          is_active?: boolean
          label?: string
          path?: string
          position?: number
        }
        Relationships: []
      }
      news_items_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          audience_role: string | null
          body: string | null
          created_at: string
          href: string | null
          id: string
          is_read: boolean
          metadata: Json
          read_at: string | null
          recipient_user_id: string | null
          title: string
          type: string
        }
        Insert: {
          audience_role?: string | null
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json
          read_at?: string | null
          recipient_user_id?: string | null
          title: string
          type: string
        }
        Update: {
          audience_role?: string | null
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json
          read_at?: string | null
          recipient_user_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      pages_content_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      photoshoot_briefs: {
        Row: {
          attachments: Json
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          legacy_id: string | null
          location: string | null
          model_ids: string[]
          raw_data: Json
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          legacy_id?: string | null
          location?: string | null
          model_ids?: string[]
          raw_data?: Json
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          legacy_id?: string | null
          location?: string | null
          model_ids?: string[]
          raw_data?: Json
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          identifier: string | null
          is_active: boolean
          metadata: Json
          model_id: string | null
          must_change_password: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          identifier?: string | null
          is_active?: boolean
          metadata?: Json
          model_id?: string | null
          must_change_password?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          identifier?: string | null
          is_active?: boolean
          metadata?: Json
          model_id?: string | null
          must_change_password?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "public_models"
            referencedColumns: ["id"]
          },
        ]
      }
      recovery_requests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          identifier: string | null
          legacy_id: string | null
          raw_data: Json
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          identifier?: string | null
          legacy_id?: string | null
          raw_data?: Json
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          identifier?: string | null
          legacy_id?: string | null
          raw_data?: Json
          status?: string
        }
        Relationships: []
      }
      registration_staff: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          legacy_id: string | null
          legacy_user_id: string | null
          name: string | null
          permissions: Json
          phone: string | null
          raw_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          legacy_id?: string | null
          legacy_user_id?: string | null
          name?: string | null
          permissions?: Json
          phone?: string | null
          raw_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          legacy_id?: string | null
          legacy_user_id?: string | null
          name?: string | null
          permissions?: Json
          phone?: string | null
          raw_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          button_link: string | null
          button_text: string | null
          category: string | null
          created_at: string
          description: string | null
          details: Json
          icon: string | null
          id: string
          is_active: boolean
          position: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          details?: Json
          icon?: string | null
          id?: string
          is_active?: boolean
          position?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          details?: Json
          icon?: string | null
          id?: string
          is_active?: boolean
          position?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_config_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      site_images_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      social_links: {
        Row: {
          is_active: boolean
          platform: string
          position: number
          url: string
        }
        Insert: {
          is_active?: boolean
          platform: string
          position?: number
          url: string
        }
        Update: {
          is_active?: boolean
          platform?: string
          position?: number
          url?: string
        }
        Relationships: []
      }
      testimonials_legacy: {
        Row: {
          data: Json
          id: string
          position: number
        }
        Insert: {
          data?: Json
          id: string
          position?: number
        }
        Update: {
          data?: Json
          id?: string
          position?: number
        }
        Relationships: []
      }
    }
    Views: {
      migration_integrity: {
        Row: {
          domain: string | null
          row_count: number | null
        }
        Relationships: []
      }
      public_models: {
        Row: {
          age: number | null
          categories: string[] | null
          created_at: string | null
          distinctions: Json | null
          experience: string | null
          fashion_day_editions: number[] | null
          gender: string | null
          height: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          is_public: boolean | null
          journey: string | null
          level: string | null
          location: string | null
          measurements: Json | null
          name: string | null
          status: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          age?: number | null
          categories?: string[] | null
          created_at?: string | null
          distinctions?: Json | null
          experience?: string | null
          fashion_day_editions?: number[] | null
          gender?: string | null
          height?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_public?: boolean | null
          journey?: string | null
          level?: string | null
          location?: string | null
          measurements?: Json | null
          name?: string | null
          status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          age?: number | null
          categories?: string[] | null
          created_at?: string | null
          distinctions?: Json | null
          experience?: string | null
          fashion_day_editions?: number[] | null
          gender?: string | null
          height?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_public?: boolean | null
          journey?: string | null
          level?: string | null
          location?: string | null
          measurements?: Json | null
          name?: string | null
          status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_app_role: { Args: never; Returns: string }
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
