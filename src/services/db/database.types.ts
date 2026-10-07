export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      avatars: {
        Row: {
          announced: string[];
          look: Json | null;
          owned: string[];
          student_id: string;
          updated_at: string;
        };
        Insert: {
          announced?: string[];
          look?: Json | null;
          owned?: string[];
          student_id?: string;
          updated_at?: string;
        };
        Update: {
          announced?: string[];
          look?: Json | null;
          owned?: string[];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'avatars_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: true;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      chapter_progress: {
        Row: {
          chapter_id: string;
          mastery: number | null;
          sessions: number;
          student_id: string;
          subject_id: Database['public']['Enums']['subject_id'];
          updated_at: string;
        };
        Insert: {
          chapter_id: string;
          mastery?: number | null;
          sessions?: number;
          student_id: string;
          subject_id: Database['public']['Enums']['subject_id'];
          updated_at?: string;
        };
        Update: {
          chapter_id?: string;
          mastery?: number | null;
          sessions?: number;
          student_id?: string;
          subject_id?: Database['public']['Enums']['subject_id'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chapter_progress_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      chapter_progress_monthly: {
        Row: {
          chapter_id: string;
          mastery: number;
          month: string;
          student_id: string;
        };
        Insert: {
          chapter_id: string;
          mastery: number;
          month: string;
          student_id: string;
        };
        Update: {
          chapter_id?: string;
          mastery?: number;
          month?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chapter_progress_monthly_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          last_message_at: string;
          session_id: string;
          student_id: string;
          title: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_message_at?: string;
          session_id: string;
          student_id: string;
          title?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_message_at?: string;
          session_id?: string;
          student_id?: string;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_session_fkey';
            columns: ['session_id', 'student_id'];
            isOneToOne: false;
            referencedRelation: 'study_sessions';
            referencedColumns: ['id', 'student_id'];
          },
          {
            foreignKeyName: 'conversations_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_activity: {
        Row: {
          cards: number;
          day: string;
          seconds: number;
          sessions: number;
          student_id: string;
          xp: number;
        };
        Insert: {
          cards?: number;
          day: string;
          seconds?: number;
          sessions?: number;
          student_id: string;
          xp?: number;
        };
        Update: {
          cards?: number;
          day?: string;
          seconds?: number;
          sessions?: number;
          student_id?: string;
          xp?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_activity_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      flashcard_reviews: {
        Row: {
          answered_at: string;
          card_id: string;
          chapter_id: string;
          correct: boolean;
          id: string;
          session_id: string;
          student_id: string;
          subject_id: Database['public']['Enums']['subject_id'];
        };
        Insert: {
          answered_at?: string;
          card_id: string;
          chapter_id: string;
          correct: boolean;
          id?: string;
          session_id: string;
          student_id?: string;
          subject_id: Database['public']['Enums']['subject_id'];
        };
        Update: {
          answered_at?: string;
          card_id?: string;
          chapter_id?: string;
          correct?: boolean;
          id?: string;
          session_id?: string;
          student_id?: string;
          subject_id?: Database['public']['Enums']['subject_id'];
        };
        Relationships: [
          {
            foreignKeyName: 'flashcard_reviews_session_fkey';
            columns: ['session_id', 'student_id'];
            isOneToOne: false;
            referencedRelation: 'study_sessions';
            referencedColumns: ['id', 'student_id'];
          },
        ];
      };
      flashcard_states: {
        Row: {
          box: number;
          card_id: string;
          chapter_id: string;
          due_on: string;
          state: Database['public']['Enums']['card_state'];
          student_id: string;
          subject_id: Database['public']['Enums']['subject_id'];
          updated_at: string;
        };
        Insert: {
          box: number;
          card_id: string;
          chapter_id: string;
          due_on: string;
          state: Database['public']['Enums']['card_state'];
          student_id: string;
          subject_id: Database['public']['Enums']['subject_id'];
          updated_at?: string;
        };
        Update: {
          box?: number;
          card_id?: string;
          chapter_id?: string;
          due_on?: string;
          state?: Database['public']['Enums']['card_state'];
          student_id?: string;
          subject_id?: Database['public']['Enums']['subject_id'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'flashcard_states_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      level_attempts: {
        Row: {
          answers: NonNullable<Json>;
          finished: boolean;
          level_id: string;
          passed: boolean | null;
          recorded_at: string | null;
          score: number | null;
          session_id: string;
          stars: number | null;
          steps_done: number;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          answers?: NonNullable<Json>;
          finished?: boolean;
          level_id: string;
          passed?: boolean | null;
          recorded_at?: string | null;
          score?: number | null;
          session_id: string;
          stars?: number | null;
          steps_done?: number;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          answers?: NonNullable<Json>;
          finished?: boolean;
          level_id?: string;
          passed?: boolean | null;
          recorded_at?: string | null;
          score?: number | null;
          session_id?: string;
          stars?: number | null;
          steps_done?: number;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'level_attempts_session_fkey';
            columns: ['session_id', 'student_id'];
            isOneToOne: false;
            referencedRelation: 'study_sessions';
            referencedColumns: ['id', 'student_id'];
          },
        ];
      };
      level_progress: {
        Row: {
          attempts: number;
          best_score: number;
          chapter_id: string;
          first_finished_at: string;
          last_played_at: string;
          level_id: string;
          level_type: Database['public']['Enums']['level_type'];
          passed: boolean;
          stars: number;
          student_id: string;
          subject_id: Database['public']['Enums']['subject_id'];
        };
        Insert: {
          attempts?: number;
          best_score: number;
          chapter_id: string;
          first_finished_at?: string;
          last_played_at?: string;
          level_id: string;
          level_type: Database['public']['Enums']['level_type'];
          passed: boolean;
          stars: number;
          student_id: string;
          subject_id: Database['public']['Enums']['subject_id'];
        };
        Update: {
          attempts?: number;
          best_score?: number;
          chapter_id?: string;
          first_finished_at?: string;
          last_played_at?: string;
          level_id?: string;
          level_type?: Database['public']['Enums']['level_type'];
          passed?: boolean;
          stars?: number;
          student_id?: string;
          subject_id?: Database['public']['Enums']['subject_id'];
        };
        Relationships: [
          {
            foreignKeyName: 'level_progress_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      link_codes: {
        Row: {
          child_first_name: string;
          child_grade: Database['public']['Enums']['grade'];
          code_hmac: string;
          created_at: string;
          expires_at: string;
          id: string;
          parent_id: string;
          used_at: string | null;
          used_by: string | null;
        };
        Insert: {
          child_first_name: string;
          child_grade: Database['public']['Enums']['grade'];
          code_hmac: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          parent_id: string;
          used_at?: string | null;
          used_by?: string | null;
        };
        Update: {
          child_first_name?: string;
          child_grade?: Database['public']['Enums']['grade'];
          code_hmac?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          parent_id?: string;
          used_at?: string | null;
          used_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'link_codes_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'parents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'link_codes_used_by_fkey';
            columns: ['used_by'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      link_requests: {
        Row: {
          created_at: string;
          parent_id: string;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          parent_id: string;
          student_id: string;
        };
        Update: {
          created_at?: string;
          parent_id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'link_requests_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'parents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'link_requests_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: true;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          role: Database['public']['Enums']['message_role'];
          student_id: string;
          visual: Json | null;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          role: Database['public']['Enums']['message_role'];
          student_id: string;
          visual?: Json | null;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          role?: Database['public']['Enums']['message_role'];
          student_id?: string;
          visual?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_fkey';
            columns: ['conversation_id', 'student_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id', 'student_id'];
          },
        ];
      };
      parent_links: {
        Row: {
          created_at: string;
          origin: Database['public']['Enums']['link_origin'];
          parent_id: string;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          origin: Database['public']['Enums']['link_origin'];
          parent_id: string;
          student_id: string;
        };
        Update: {
          created_at?: string;
          origin?: Database['public']['Enums']['link_origin'];
          parent_id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'parent_links_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'parents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'parent_links_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      parental_consents: {
        Row: {
          granted_at: string;
          id: string;
          method: Database['public']['Enums']['link_origin'];
          parent_id: string | null;
          student_id: string;
        };
        Insert: {
          granted_at?: string;
          id?: string;
          method: Database['public']['Enums']['link_origin'];
          parent_id?: string | null;
          student_id: string;
        };
        Update: {
          granted_at?: string;
          id?: string;
          method?: Database['public']['Enums']['link_origin'];
          parent_id?: string | null;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'parental_consents_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'parents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'parental_consents_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      parental_settings: {
        Row: {
          allowed_from: string;
          allowed_until: string;
          camera_enabled: boolean;
          daily_limit_enabled: boolean;
          daily_limit_minutes: number;
          evening_pause: boolean;
          student_id: string;
          updated_at: string;
          updated_by: string | null;
          visuals_enabled: boolean;
          voice_enabled: boolean;
          weekly_goal_hours: number;
        };
        Insert: {
          allowed_from?: string;
          allowed_until?: string;
          camera_enabled?: boolean;
          daily_limit_enabled?: boolean;
          daily_limit_minutes?: number;
          evening_pause?: boolean;
          student_id: string;
          updated_at?: string;
          updated_by?: string | null;
          visuals_enabled?: boolean;
          voice_enabled?: boolean;
          weekly_goal_hours?: number;
        };
        Update: {
          allowed_from?: string;
          allowed_until?: string;
          camera_enabled?: boolean;
          daily_limit_enabled?: boolean;
          daily_limit_minutes?: number;
          evening_pause?: boolean;
          student_id?: string;
          updated_at?: string;
          updated_by?: string | null;
          visuals_enabled?: boolean;
          voice_enabled?: boolean;
          weekly_goal_hours?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'parental_settings_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: true;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'parental_settings_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'parents';
            referencedColumns: ['id'];
          },
        ];
      };
      parents: {
        Row: {
          alerts: boolean;
          created_at: string;
          id: string;
          terms_accepted_at: string | null;
          weekly_report: boolean;
        };
        Insert: {
          alerts?: boolean;
          created_at?: string;
          id: string;
          terms_accepted_at?: string | null;
          weekly_report?: boolean;
        };
        Update: {
          alerts?: boolean;
          created_at?: string;
          id?: string;
          terms_accepted_at?: string | null;
          weekly_report?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'parents_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          first_name: string | null;
          id: string;
          role: Database['public']['Enums']['user_role'];
        };
        Insert: {
          created_at?: string;
          first_name?: string | null;
          id: string;
          role: Database['public']['Enums']['user_role'];
        };
        Update: {
          created_at?: string;
          first_name?: string | null;
          id?: string;
          role?: Database['public']['Enums']['user_role'];
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          hits: number;
          key: string;
          window_start: string;
        };
        Insert: {
          hits?: number;
          key: string;
          window_start: string;
        };
        Update: {
          hits?: number;
          key?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      self_assessments: {
        Row: {
          level: Database['public']['Enums']['comfort_level'];
          student_id: string;
          subject_id: Database['public']['Enums']['subject_id'];
          updated_at: string;
        };
        Insert: {
          level: Database['public']['Enums']['comfort_level'];
          student_id: string;
          subject_id: Database['public']['Enums']['subject_id'];
          updated_at?: string;
        };
        Update: {
          level?: Database['public']['Enums']['comfort_level'];
          student_id?: string;
          subject_id?: Database['public']['Enums']['subject_id'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'self_assessments_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      student_progress: {
        Row: {
          last_active_day: string | null;
          record_streak: number;
          streak_days: number;
          student_id: string;
          updated_at: string;
          xp: number;
        };
        Insert: {
          last_active_day?: string | null;
          record_streak?: number;
          streak_days?: number;
          student_id: string;
          updated_at?: string;
          xp?: number;
        };
        Update: {
          last_active_day?: string | null;
          record_streak?: number;
          streak_days?: number;
          student_id?: string;
          updated_at?: string;
          xp?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'student_progress_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: true;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      students: {
        Row: {
          consent_status: Database['public']['Enums']['consent_status'];
          created_at: string;
          daily_minutes: number | null;
          goals: Database['public']['Enums']['learning_goal'][];
          grade: Database['public']['Enums']['grade'] | null;
          id: string;
          modes: Database['public']['Enums']['learning_mode'][];
          moments: Database['public']['Enums']['study_moment'][];
          onboarding_completed_at: string | null;
          reminder_enabled: boolean;
          terms_accepted_at: string;
          under_15: boolean;
        };
        Insert: {
          consent_status: Database['public']['Enums']['consent_status'];
          created_at?: string;
          daily_minutes?: number | null;
          goals?: Database['public']['Enums']['learning_goal'][];
          grade?: Database['public']['Enums']['grade'] | null;
          id: string;
          modes?: Database['public']['Enums']['learning_mode'][];
          moments?: Database['public']['Enums']['study_moment'][];
          onboarding_completed_at?: string | null;
          reminder_enabled?: boolean;
          terms_accepted_at?: string;
          under_15: boolean;
        };
        Update: {
          consent_status?: Database['public']['Enums']['consent_status'];
          created_at?: string;
          daily_minutes?: number | null;
          goals?: Database['public']['Enums']['learning_goal'][];
          grade?: Database['public']['Enums']['grade'] | null;
          id?: string;
          modes?: Database['public']['Enums']['learning_mode'][];
          moments?: Database['public']['Enums']['study_moment'][];
          onboarding_completed_at?: string | null;
          reminder_enabled?: boolean;
          terms_accepted_at?: string;
          under_15?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'students_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      study_sessions: {
        Row: {
          cards_answered: number;
          cards_correct: number;
          chapter_id: string | null;
          duration_seconds: number;
          ended_at: string | null;
          id: string;
          level_id: string | null;
          mode: Database['public']['Enums']['session_mode'];
          outcome: Database['public']['Enums']['session_outcome'] | null;
          started_at: string;
          student_id: string;
          subject_id: Database['public']['Enums']['subject_id'] | null;
          summary_to_review: string | null;
          summary_understood: string | null;
          tools: Database['public']['Enums']['session_tool'][];
          xp: number;
        };
        Insert: {
          cards_answered?: number;
          cards_correct?: number;
          chapter_id?: string | null;
          duration_seconds?: number;
          ended_at?: string | null;
          id?: string;
          level_id?: string | null;
          mode: Database['public']['Enums']['session_mode'];
          outcome?: Database['public']['Enums']['session_outcome'] | null;
          started_at?: string;
          student_id?: string;
          subject_id?: Database['public']['Enums']['subject_id'] | null;
          summary_to_review?: string | null;
          summary_understood?: string | null;
          tools?: Database['public']['Enums']['session_tool'][];
          xp?: number;
        };
        Update: {
          cards_answered?: number;
          cards_correct?: number;
          chapter_id?: string | null;
          duration_seconds?: number;
          ended_at?: string | null;
          id?: string;
          level_id?: string | null;
          mode?: Database['public']['Enums']['session_mode'];
          outcome?: Database['public']['Enums']['session_outcome'] | null;
          started_at?: string;
          student_id?: string;
          subject_id?: Database['public']['Enums']['subject_id'] | null;
          summary_to_review?: string | null;
          summary_understood?: string | null;
          tools?: Database['public']['Enums']['session_tool'][];
          xp?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'study_sessions_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      tutor_reports: {
        Row: {
          chapter_id: string | null;
          created_at: string;
          excerpt: string;
          id: string;
          prompt_version: string;
          student_id: string;
          subject_id: Database['public']['Enums']['subject_id'] | null;
        };
        Insert: {
          chapter_id?: string | null;
          created_at?: string;
          excerpt: string;
          id?: string;
          prompt_version: string;
          student_id: string;
          subject_id?: Database['public']['Enums']['subject_id'] | null;
        };
        Update: {
          chapter_id?: string | null;
          created_at?: string;
          excerpt?: string;
          id?: string;
          prompt_version?: string;
          student_id?: string;
          subject_id?: Database['public']['Enums']['subject_id'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tutor_reports_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      weekly_reports: {
        Row: {
          generated_at: string;
          student_id: string;
          summary: string;
          week_start: string;
        };
        Insert: {
          generated_at?: string;
          student_id: string;
          summary: string;
          week_start: string;
        };
        Update: {
          generated_at?: string;
          student_id?: string;
          summary?: string;
          week_start?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'weekly_reports_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_link_request: { Args: { p_parent_id: string; p_student_id: string }; Returns: string };
      consume_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number };
        Returns: boolean;
      };
      create_link_code: {
        Args: {
          p_child_first_name: string;
          p_child_grade: Database['public']['Enums']['grade'];
          p_code_hmac: string;
          p_parent_id: string;
        };
        Returns: {
          expires_at: string;
          status: string;
        }[];
      };
      finalize_parent_account: {
        Args: { p_first_name: string; p_parent_id: string };
        Returns: undefined;
      };
      find_account_by_email: {
        Args: { p_email: string };
        Returns: {
          id: string;
          role: Database['public']['Enums']['user_role'];
        }[];
      };
      finish_level: {
        Args: {
          p_chapter_id: string;
          p_level_id: string;
          p_level_type: Database['public']['Enums']['level_type'];
          p_passed: boolean;
          p_score: number;
          p_session_id: string;
          p_stars: number;
          p_student_id: string;
          p_subject_id: Database['public']['Enums']['subject_id'];
        };
        Returns: number;
      };
      redeem_link_code: {
        Args: { p_code_hmac: string; p_student_id: string };
        Returns: {
          parent_id: string;
          status: string;
        }[];
      };
      tutor_context: {
        Args: { p_student_id: string };
        Returns: {
          allowed_from: string;
          allowed_until: string;
          camera_enabled: boolean;
          consent_status: Database['public']['Enums']['consent_status'];
          daily_limit_enabled: boolean;
          daily_limit_minutes: number;
          evening_pause: boolean;
          today_seconds: number;
          visuals_enabled: boolean;
          voice_enabled: boolean;
        }[];
      };
    };
    Enums: {
      card_state: 'known' | 'to_review';
      comfort_level: 'struggling' | 'meh' | 'ok' | 'confident';
      consent_status: 'not_required' | 'pending' | 'granted';
      grade:
        'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2' | '6e' | '5e' | '4e' | '3e' | '2de' | '1re' | 'Tle';
      learning_goal:
        | 'raise_grades'
        | 'understand'
        | 'prepare_tests'
        | 'national_exam'
        | 'get_ahead'
        | 'homework_faster';
      learning_mode: 'written' | 'voice' | 'visual' | 'quiz';
      level_type: 'lecon' | 'exercices' | 'evaluation';
      link_origin: 'link_code' | 'request';
      message_role: 'student' | 'tutor';
      session_mode: 'written' | 'voice' | 'flashcards';
      session_outcome: 'understood' | 'progressing' | 'to_review';
      session_tool: 'graph' | 'whiteboard';
      study_moment: 'morning' | 'after_school' | 'evening' | 'weekend';
      subject_id: 'maths' | 'francais' | 'histoire-geo' | 'anglais' | 'svt' | 'physique-chimie';
      user_role: 'student' | 'parent';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      card_state: ['known', 'to_review'],
      comfort_level: ['struggling', 'meh', 'ok', 'confident'],
      consent_status: ['not_required', 'pending', 'granted'],
      grade: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle'],
      learning_goal: [
        'raise_grades',
        'understand',
        'prepare_tests',
        'national_exam',
        'get_ahead',
        'homework_faster',
      ],
      learning_mode: ['written', 'voice', 'visual', 'quiz'],
      level_type: ['lecon', 'exercices', 'evaluation'],
      link_origin: ['link_code', 'request'],
      message_role: ['student', 'tutor'],
      session_mode: ['written', 'voice', 'flashcards'],
      session_outcome: ['understood', 'progressing', 'to_review'],
      session_tool: ['graph', 'whiteboard'],
      study_moment: ['morning', 'after_school', 'evening', 'weekend'],
      subject_id: ['maths', 'francais', 'histoire-geo', 'anglais', 'svt', 'physique-chimie'],
      user_role: ['student', 'parent'],
    },
  },
} as const;
