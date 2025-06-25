'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Json } from '@/lib/supabase/types';

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

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OfferData {
  id: string;
  assistant_id: string | null;
  customer_info: CustomerInfo;
  offer_details: OfferDetails;
  chat_messages?: ChatMessage[] | null;
  status: 'pending' | 'completed' | null;
  created_at: string;
  updated_at: string | null;
}

export async function createOffer(data: {
  assistantId: string;
  customerInfo: CustomerInfo;
  offerDetails: OfferDetails;
  chatMessages?: ChatMessage[];
}): Promise<{ success: boolean; offerId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { data: insertData, error } = await supabase
      .from('offers')
      .insert({
        assistant_id: data.assistantId,
        customer_info: data.customerInfo as unknown as Json,
        offer_details: data.offerDetails as unknown as Json,
        chat_messages: (data.chatMessages || []) as unknown as Json,
        status: 'completed'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating offer:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/offers');
    return { success: true, offerId: insertData.id };
  } catch (error) {
    console.error('Error creating offer:', error);
    return { success: false, error: 'Failed to create offer' };
  }
}

export async function getOffers(): Promise<OfferData[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('offers')
      .select(`
        id,
        assistant_id,
        customer_info,
        offer_details,
        chat_messages,
        status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
      return [];
    }

    return (data || []).map(offer => ({
      ...offer,
      customer_info: offer.customer_info as unknown as CustomerInfo,
      offer_details: offer.offer_details as unknown as OfferDetails,
      chat_messages: offer.chat_messages as unknown as ChatMessage[] | null,
      status: offer.status as 'pending' | 'completed' | null
    }));
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
}

export async function getOfferById(id: string): Promise<OfferData | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('offers')
      .select(`
        id,
        assistant_id,
        customer_info,
        offer_details,
        chat_messages,
        status,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching offer:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      customer_info: data.customer_info as unknown as CustomerInfo,
      offer_details: data.offer_details as unknown as OfferDetails,
      chat_messages: data.chat_messages as unknown as ChatMessage[] | null,
      status: data.status as 'pending' | 'completed' | null
    };
  } catch (error) {
    console.error('Error fetching offer:', error);
    return null;
  }
}

export async function deleteOffer(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting offer:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/offers');
    return { success: true };
  } catch (error) {
    console.error('Error deleting offer:', error);
    return { success: false, error: 'Failed to delete offer' };
  }
}

export async function updateOfferStatus(
  id: string, 
  status: 'pending' | 'completed'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating offer status:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/offers');
    return { success: true };
  } catch (error) {
    console.error('Error updating offer status:', error);
    return { success: false, error: 'Failed to update offer status' };
  }
}