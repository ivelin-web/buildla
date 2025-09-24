import { ModelType, VerbosityLevel, ReasoningEffortLevel } from '@/types/model-settings';

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
          is_public: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          system_prompt: string
          category?: string | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          system_prompt?: string
          category?: string | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      model_settings: {
        Row: {
          id: string
          model: ModelType
          max_tokens: number
          verbosity: VerbosityLevel
          reasoning_effort: ReasoningEffortLevel
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          model?: ModelType
          max_tokens?: number
          verbosity?: VerbosityLevel
          reasoning_effort?: ReasoningEffortLevel
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          model?: ModelType
          max_tokens?: number
          verbosity?: VerbosityLevel
          reasoning_effort?: ReasoningEffortLevel
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
      faq_embeddings: {
        Row: {
          id: string
          content: string
          embedding: number[] | null
          url: string
          title: string | null
          source_website: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          embedding?: number[] | null
          url: string
          title?: string | null
          source_website?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          embedding?: number[] | null
          url?: string
          title?: string | null
          source_website?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_faq_embeddings: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          content: string
          title: string | null
          url: string
          similarity: number
          source_website: string | null
        }[]
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

export type FAQEmbedding = Database['public']['Tables']['faq_embeddings']['Row']
export type InsertFAQEmbedding = Database['public']['Tables']['faq_embeddings']['Insert']
export type UpdateFAQEmbedding = Database['public']['Tables']['faq_embeddings']['Update']