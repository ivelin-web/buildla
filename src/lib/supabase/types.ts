export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assistants: {
        Row: {
          id: string
          name: string
          description: string
          system_prompt: string
          category: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          system_prompt: string
          category?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          system_prompt?: string
          category?: string | null
          created_at?: string
          updated_at?: string | null
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

// Convenience types
export type Assistant = Database['public']['Tables']['assistants']['Row']
export type InsertAssistant = Database['public']['Tables']['assistants']['Insert']
export type UpdateAssistant = Database['public']['Tables']['assistants']['Update']