export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Re-export Supabase types for consistency
export type { Assistant, InsertAssistant, UpdateAssistant } from '@/lib/supabase/types';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface OfferDetails {
  area: number;
  form: string;
  builtBefore1950: boolean;
  tileType: string;
  builtInDetails: number;
  parkingZone: number | null;
  rotPersons: number;
  laborCost: number;
  materialCost: number;
  transportCost: number;
  parkingCost: number;
  rotDeduction: number;
  totalIncVat: number;
}

export interface Offer {
  id: string;
  assistant_id: string | null;
  customer_info: CustomerInfo;
  offer_details: OfferDetails;
  chat_messages?: ChatMessage[] | null;
  status: 'pending' | 'completed' | null;
  created_at: string;
  updated_at: string | null;
}

export interface ChatResponse {
  reply: string;
  taskName: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
} 