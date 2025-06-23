export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Re-export Supabase types for consistency
export type { Assistant, InsertAssistant, UpdateAssistant } from '@/lib/supabase/types';

// Keep Task interface for backward compatibility, mapping to Assistant
export interface Task {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface OfferDetails {
  area: number;
  laborCost: number;
  materialCost: number;
  transportCost: number;
  parkingCost: number;
  rotDeduction: number;
  totalIncVat: number;
  features: string[];
}

export interface Offer {
  id: string;
  taskId: string;
  taskName: string;
  customerInfo: CustomerInfo;
  offerDetails: OfferDetails;
  chatHistory: ChatMessage[];
  createdAt: string;
  status: 'completed' | 'pending';
}

export interface ChatResponse {
  reply: string;
  taskName: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
} 