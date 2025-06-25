import { ModelType } from '@/types/model-settings';

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
          first_message: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          system_prompt: string
          category?: string | null
          first_message?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          system_prompt?: string
          category?: string | null
          first_message?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      model_settings: {
        Row: {
          id: string
          model: ModelType
          temperature: number
          max_tokens: number
          top_p: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          model?: ModelType
          temperature?: number
          max_tokens?: number
          top_p?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          model?: ModelType
          temperature?: number
          max_tokens?: number
          top_p?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          id: string
          assistant_id: string | null
          customer_info: Json
          offer_details: Json
          chat_messages: Json | null
          status: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          assistant_id?: string | null
          customer_info: Json
          offer_details: Json
          chat_messages?: Json | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          assistant_id?: string | null
          customer_info?: Json
          offer_details?: Json
          chat_messages?: Json | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          }
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

// Convenience types
export type Assistant = Database['public']['Tables']['assistants']['Row']
export type InsertAssistant = Database['public']['Tables']['assistants']['Insert']
export type UpdateAssistant = Database['public']['Tables']['assistants']['Update']

export type ModelSettings = Database['public']['Tables']['model_settings']['Row']
export type InsertModelSettings = Database['public']['Tables']['model_settings']['Insert']
export type UpdateModelSettings = Database['public']['Tables']['model_settings']['Update']

export type Offer = Database['public']['Tables']['offers']['Row']
export type InsertOffer = Database['public']['Tables']['offers']['Insert']
export type UpdateOffer = Database['public']['Tables']['offers']['Update']