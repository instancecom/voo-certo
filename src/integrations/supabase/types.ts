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
      admin_drive_tokens: {
        Row: {
          access_token: string
          created_at: string
          folder_id: string | null
          id: string
          refresh_token: string
          token_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          folder_id?: string | null
          id?: string
          refresh_token: string
          token_expires_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          folder_id?: string | null
          id?: string
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_youtube_tokens: {
        Row: {
          access_token: string
          channel_id: string | null
          channel_title: string | null
          created_at: string
          id: string
          refresh_token: string
          token_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          channel_id?: string | null
          channel_title?: string | null
          created_at?: string
          id?: string
          refresh_token: string
          token_expires_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          channel_id?: string | null
          channel_title?: string | null
          created_at?: string
          id?: string
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_question_cache: {
        Row: {
          ai_response: string
          created_at: string
          expires_at: string
          id: string
          question_hash: string
          question_id: string
          user_question: string
        }
        Insert: {
          ai_response: string
          created_at?: string
          expires_at?: string
          id?: string
          question_hash: string
          question_id: string
          user_question: string
        }
        Update: {
          ai_response?: string
          created_at?: string
          expires_at?: string
          id?: string
          question_hash?: string
          question_id?: string
          user_question?: string
        }
        Relationships: []
      }
      badge_proof_cleanup_log: {
        Row: {
          acceptance_date: string | null
          codigo_id: string | null
          created_at: string
          doc_accepted: boolean | null
          file_deleted_at: string | null
          file_path: string
          historico_resumido: string | null
          id: string
          user_name: string | null
          verification_id: string
        }
        Insert: {
          acceptance_date?: string | null
          codigo_id?: string | null
          created_at?: string
          doc_accepted?: boolean | null
          file_deleted_at?: string | null
          file_path: string
          historico_resumido?: string | null
          id?: string
          user_name?: string | null
          verification_id: string
        }
        Update: {
          acceptance_date?: string | null
          codigo_id?: string | null
          created_at?: string
          doc_accepted?: boolean | null
          file_deleted_at?: string | null
          file_path?: string
          historico_resumido?: string | null
          id?: string
          user_name?: string | null
          verification_id?: string
        }
        Relationships: []
      }
      badge_verifications: {
        Row: {
          admin_notes: string | null
          anac_code: string | null
          approval_id: string | null
          id: string
          insignia_id: string | null
          proof_type: string
          proof_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          anac_code?: string | null
          approval_id?: string | null
          id?: string
          insignia_id?: string | null
          proof_type: string
          proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          anac_code?: string | null
          approval_id?: string | null
          id?: string
          insignia_id?: string | null
          proof_type?: string
          proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_verifications_insignia_id_fkey"
            columns: ["insignia_id"]
            isOneToOne: false
            referencedRelation: "insignias"
            referencedColumns: ["id"]
          },
        ]
      }
      career_guide_steps: {
        Row: {
          created_at: string | null
          description: string | null
          guide_id: string
          id: string
          microcourse_ids: string[] | null
          simulado_ids: string[] | null
          step_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          guide_id: string
          id?: string
          microcourse_ids?: string[] | null
          simulado_ids?: string[] | null
          step_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          guide_id?: string
          id?: string
          microcourse_ids?: string[] | null
          simulado_ids?: string[] | null
          step_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_guide_steps_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "career_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      career_guides: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active_modes: string[] | null
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          total_time: number | null
        }
        Insert: {
          active_modes?: string[] | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          total_time?: number | null
        }
        Update: {
          active_modes?: string[] | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          total_time?: number | null
        }
        Relationships: []
      }
      coupon_uses: {
        Row: {
          coupon_id: string
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_uses_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          duration: string
          duration_in_months: number | null
          ends_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          max_uses_per_user: number | null
          min_amount: number | null
          plan_id: string | null
          starts_at: string | null
          stripe_coupon_id: string | null
          stripe_promotion_code_id: string | null
          type: string
          updated_at: string
          uses_count: number
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          duration?: string
          duration_in_months?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_amount?: number | null
          plan_id?: string | null
          starts_at?: string | null
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          type?: string
          updated_at?: string
          uses_count?: number
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          duration?: string
          duration_in_months?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_amount?: number | null
          plan_id?: string | null
          starts_at?: string | null
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          type?: string
          updated_at?: string
          uses_count?: number
          value?: number
        }
        Relationships: []
      }
      curriculum_data: {
        Row: {
          certificates: Json | null
          city: string | null
          created_at: string
          education: Json | null
          email: string | null
          experience: Json | null
          full_name: string | null
          id: string
          languages: Json | null
          phone: string | null
          photo_url: string | null
          profession: string | null
          skills: string[] | null
          summary: string | null
          template: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certificates?: Json | null
          city?: string | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          full_name?: string | null
          id?: string
          languages?: Json | null
          phone?: string | null
          photo_url?: string | null
          profession?: string | null
          skills?: string[] | null
          summary?: string | null
          template?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certificates?: Json | null
          city?: string | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          full_name?: string | null
          id?: string
          languages?: Json | null
          phone?: string | null
          photo_url?: string | null
          profession?: string | null
          skills?: string[] | null
          summary?: string | null
          template?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exam_questions: {
        Row: {
          exam_id: string
          id: string
          order_index: number | null
          question_id: string
        }
        Insert: {
          exam_id: string
          id?: string
          order_index?: number | null
          question_id: string
        }
        Update: {
          exam_id?: string
          id?: string
          order_index?: number | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          answers: Json
          block_results: Json | null
          completed_at: string
          correct_answers: number
          exam_id: string
          exam_mode: string | null
          id: string
          score: number
          time_spent: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          block_results?: Json | null
          completed_at?: string
          correct_answers: number
          exam_id: string
          exam_mode?: string | null
          id?: string
          score: number
          time_spent: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          block_results?: Json | null
          completed_at?: string
          correct_answers?: number
          exam_id?: string
          exam_mode?: string | null
          id?: string
          score?: number
          time_spent?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          category_id: string
          created_at: string
          created_by: string | null
          description: string | null
          duration: number
          icon: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          question_count: number
          random_order: boolean | null
          subcategory_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          question_count?: number
          random_order?: boolean | null
          subcategory_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          question_count?: number
          random_order?: boolean | null
          subcategory_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      guia_etapas: {
        Row: {
          created_at: string
          description: string
          details: Json
          display_order: number | null
          emoji: string
          id: string
          is_active: boolean | null
          simulado_ids: Json | null
          step_number: number
          tips: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          details?: Json
          display_order?: number | null
          emoji?: string
          id?: string
          is_active?: boolean | null
          simulado_ids?: Json | null
          step_number: number
          tips?: Json
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          details?: Json
          display_order?: number | null
          emoji?: string
          id?: string
          is_active?: boolean | null
          simulado_ids?: Json | null
          step_number?: number
          tips?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      guide_step_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          step_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          step_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          step_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_step_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "career_guide_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      insignias: {
        Row: {
          condition_type: string
          condition_value: number
          created_at: string
          description: string
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          model_url: string | null
          name: string
          rarity: Database["public"]["Enums"]["badge_rarity"]
          updated_at: string
        }
        Insert: {
          condition_type: string
          condition_value?: number
          created_at?: string
          description: string
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          model_url?: string | null
          name: string
          rarity?: Database["public"]["Enums"]["badge_rarity"]
          updated_at?: string
        }
        Update: {
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          model_url?: string | null
          name?: string
          rarity?: Database["public"]["Enums"]["badge_rarity"]
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          is_premium: boolean
          material_drive_folder: string | null
          material_name: string | null
          material_url: string | null
          module_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          is_premium?: boolean
          material_drive_folder?: string | null
          material_name?: string | null
          material_url?: string | null
          module_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          is_premium?: boolean
          material_drive_folder?: string | null
          material_name?: string | null
          material_url?: string | null
          module_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      microcourse_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          microcourse_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          microcourse_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          microcourse_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "microcourse_progress_microcourse_id_fkey"
            columns: ["microcourse_id"]
            isOneToOne: false
            referencedRelation: "microcourses"
            referencedColumns: ["id"]
          },
        ]
      }
      microcourses: {
        Row: {
          category: string
          content: string | null
          created_at: string
          description: string | null
          display_order: number | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          microcourse_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          microcourse_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          microcourse_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_microcourse_id_fkey"
            columns: ["microcourse_id"]
            isOneToOne: false
            referencedRelation: "microcourses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_questions_count: number
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_premium: boolean | null
          plan_expires_at: string | null
          plan_type: string
          premium_expires_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_questions_count?: number
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_premium?: boolean | null
          plan_expires_at?: string | null
          plan_type?: string
          premium_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_questions_count?: number
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_premium?: boolean | null
          plan_expires_at?: string | null
          plan_type?: string
          premium_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          audio_storage_path: string | null
          audio_url: string | null
          block_number: number | null
          category_id: string
          correct_answer: number
          created_at: string
          created_by: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          explanation: string | null
          id: string
          image_url: string | null
          options: Json
          subcategory_id: string
          text: string
          updated_at: string
        }
        Insert: {
          audio_storage_path?: string | null
          audio_url?: string | null
          block_number?: number | null
          category_id: string
          correct_answer: number
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          options?: Json
          subcategory_id: string
          text: string
          updated_at?: string
        }
        Update: {
          audio_storage_path?: string | null
          audio_url?: string | null
          block_number?: number | null
          category_id?: string
          correct_answer?: number
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          options?: Json
          subcategory_id?: string
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          num_questions_expected: number | null
          slug: string
          time_limit: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          num_questions_expected?: number | null
          slug: string
          time_limit?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          num_questions_expected?: number | null
          slug?: string
          time_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_insignias: {
        Row: {
          earned_at: string
          id: string
          insignia_id: string
          user_id: string
        }
        Insert: {
          earned_at?: string
          id?: string
          insignia_id: string
          user_id: string
        }
        Update: {
          earned_at?: string
          id?: string
          insignia_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_insignias_insignia_id_fkey"
            columns: ["insignia_id"]
            isOneToOne: false
            referencedRelation: "insignias"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "premium" | "admin"
      badge_rarity: "bronze" | "silver" | "gold" | "platinum"
      difficulty_level: "easy" | "medium" | "hard"
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
      app_role: ["user", "premium", "admin"],
      badge_rarity: ["bronze", "silver", "gold", "platinum"],
      difficulty_level: ["easy", "medium", "hard"],
    },
  },
} as const
