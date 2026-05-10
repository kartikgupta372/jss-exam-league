// Placeholder Supabase database types
// These will be fully generated after running: supabase gen types typescript --local
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          year: number | null
          branch: string | null
          roll_number: string | null
          role: 'student' | 'admin' | 'blocked'
          karma_points: number
          quiz_points: number
          warnings_count: number
          anonymous_mode: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'karma_points' | 'quiz_points' | 'warnings_count' | 'anonymous_mode' | 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      subjects: {
        Row: {
          id: string
          name: string
          code: string | null
          year: number
          semester: number | null
          branch: string | null
          description: string | null
          icon_emoji: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['subjects']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>
      }
      materials: {
        Row: {
          id: string
          title: string
          description: string | null
          subject_id: string
          type: 'full_notes' | 'summary' | 'unit_test' | 'youtube'
          file_url: string | null
          youtube_url: string | null
          source_material_id: string | null
          ai_generated: boolean
          ai_summary_text: string | null
          uploaded_by: string
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          approved_by: string | null
          approved_at: string | null
          view_count: number
          download_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['materials']['Row'], 'id' | 'ai_generated' | 'view_count' | 'download_count' | 'created_at'>
        Update: Partial<Database['public']['Tables']['materials']['Insert']>
      }
      quizzes: {
        Row: {
          id: string
          subject_id: string
          title: string
          description: string | null
          year: number | null
          total_questions: number | null
          time_limit_min: number
          max_attempts: number
          retake_threshold: number
          created_by: string
          published: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quizzes']['Row'], 'id' | 'time_limit_min' | 'max_attempts' | 'retake_threshold' | 'published' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quizzes']['Insert']>
      }
      doubts: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          title: string
          body: string
          image_url: string | null
          status: 'open' | 'resolved'
          accepted_reply_id: string | null
          view_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['doubts']['Row'], 'id' | 'status' | 'view_count' | 'created_at'>
        Update: Partial<Database['public']['Tables']['doubts']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'approval' | 'rejection' | 'warning' | 'reply' | 'accepted_answer'
          title: string
          body: string
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'read' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Shorthand types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subject = Database['public']['Tables']['subjects']['Row']
export type Material = Database['public']['Tables']['materials']['Row']
export type Quiz = Database['public']['Tables']['quizzes']['Row']
export type Doubt = Database['public']['Tables']['doubts']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
