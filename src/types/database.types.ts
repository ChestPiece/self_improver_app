export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          target_value: number | null;
          current_value: number | null;
          target_date: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          target_value?: number | null;
          current_value?: number | null;
          target_date?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          target_value?: number | null;
          current_value?: number | null;
          target_date?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      practices: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          duration: number | null;
          difficulty_level: string | null;
          instructions: string[] | null;
          is_premium: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: string;
          duration?: number | null;
          difficulty_level?: string | null;
          instructions?: string[] | null;
          is_premium?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          duration?: number | null;
          difficulty_level?: string | null;
          instructions?: string[] | null;
          is_premium?: boolean | null;
          created_at?: string;
        };
      };
      practice_sessions: {
        Row: {
          id: string;
          user_id: string;
          practice_id: string;
          duration: number | null;
          completed_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          practice_id: string;
          duration?: number | null;
          completed_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          practice_id?: string;
          duration?: number | null;
          completed_at?: string;
          notes?: string | null;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          frequency: string;
          target_count: number | null;
          current_streak: number | null;
          best_streak: number | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          frequency: string;
          target_count?: number | null;
          current_streak?: number | null;
          best_streak?: number | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          frequency?: string;
          target_count?: number | null;
          current_streak?: number | null;
          best_streak?: number | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          completed_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          completed_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          completed_at?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          settings: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      onboarding_progress: {
        Row: {
          id: string;
          user_id: string;
          step: string;
          completed: boolean;
          data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          step: string;
          completed?: boolean;
          data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          step?: string;
          completed?: boolean;
          data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
