'use server';

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";
import { Json, type OfferFile } from "@/lib/supabase/types";

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
  files: OfferFile[];
}

export async function createOffer(data: {
  assistantId: string;
  customerInfo: CustomerInfo;
  offerDetails: OfferDetails;
  chatMessages?: unknown;
  uploadSessionId?: string;
}): Promise<{ success: boolean; offerId?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const serviceSupabase = data.uploadSessionId ? createServiceRoleClient() : null;

    const sanitizedMessages = sanitizeChatMessages(data.chatMessages);

    const { data: insertData, error } = await supabase
      .from('offers')
      .insert({
        assistant_id: data.assistantId,
        customer_info: data.customerInfo as unknown as Json,
        offer_details: data.offerDetails as unknown as Json,
        chat_messages: sanitizedMessages as unknown as Json,
        status: 'completed'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating offer:', error);
      return { success: false, error: error.message };
    }

    if (data.uploadSessionId && serviceSupabase) {
      try {
        const { error: linkError } = await serviceSupabase
          .from('offer_files')
          .update({ offer_id: insertData.id })
          .eq('session_id', data.uploadSessionId)
          .is('offer_id', null);

        if (linkError) {
          console.error('Failed to link uploaded files to offer:', linkError);
        }
      } catch (linkError) {
        console.error('Unexpected error while linking uploaded files:', linkError);
      }
    }

    revalidatePath('/dashboard/offers');
    return { success: true, offerId: insertData.id };
  } catch (error) {
    console.error('Error creating offer:', error);
    return { success: false, error: 'Failed to create offer' };
  }
}

type RawChatMessage = {
  role?: string;
  parts?: Array<{
    type?: string;
    text?: string;
  }>;
  content?: string;
};

function sanitizeChatMessages(rawMessages: unknown): ChatMessage[] {
  if (!Array.isArray(rawMessages)) {
    return [];
  }

  return rawMessages.reduce<ChatMessage[]>((acc, message) => {
    if (!message || typeof message !== 'object') {
      return acc;
    }

    const { role, parts, content } = message as RawChatMessage;
    const normalizedRole: ChatMessage['role'] =
      role === 'assistant' || role === 'system' ? role : 'user';

    const partArray = Array.isArray(parts) ? parts : [];
    const textSegments: string[] = [];

    for (const part of partArray) {
      if (!part || typeof part !== 'object') {
        continue;
      }

      if (part.type === 'text' && typeof part.text === 'string') {
        const trimmed = part.text.trim();
        if (trimmed) {
          textSegments.push(trimmed);
        }
      }
    }

    if (typeof content === 'string' && content.trim().length > 0) {
      textSegments.push(content.trim());
    }

    const combinedContent = textSegments.filter(Boolean).join('\n\n').trim();

    if (!combinedContent) {
      return acc;
    }

    acc.push({
      role: normalizedRole,
      content: combinedContent
    });

    return acc;
  }, []);
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

    const normalizedOffers = (data || []).map(offer => ({
      ...offer,
      customer_info: offer.customer_info as unknown as CustomerInfo,
      offer_details: offer.offer_details as unknown as OfferDetails,
      chat_messages: offer.chat_messages as unknown as ChatMessage[] | null,
      status: offer.status as 'pending' | 'completed' | null
    }));

    const offerIds = normalizedOffers.map((offer) => offer.id);
    let filesByOfferId = new Map<string, OfferFile[]>();

    if (offerIds.length > 0) {
      try {
        const serviceSupabase = createServiceRoleClient();
        const { data: filesData, error: filesError } = await serviceSupabase
          .from('offer_files')
          .select('*')
          .in('offer_id', offerIds)
          .order('created_at', { ascending: true });

        if (filesError) {
          console.error('Error fetching offer files:', filesError);
        } else if (filesData) {
          filesByOfferId = filesData.reduce((acc, file) => {
            const offerId = file.offer_id;
            if (!offerId) {
              return acc;
            }

            const list = acc.get(offerId) ?? [];
            acc.set(offerId, [...list, file as OfferFile]);
            return acc;
          }, new Map<string, OfferFile[]>());
        }
      } catch (filesError) {
        console.error('Unexpected error fetching offer files:', filesError);
      }
    }

    return normalizedOffers.map((offer) => ({
      ...offer,
      files: filesByOfferId.get(offer.id) ?? []
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

    let files: OfferFile[] = [];

    try {
      const serviceSupabase = createServiceRoleClient();
      const { data: filesData, error: filesError } = await serviceSupabase
        .from('offer_files')
        .select('*')
        .eq('offer_id', id)
        .order('created_at', { ascending: true });

      if (filesError) {
        console.error('Error fetching offer files:', filesError);
      } else if (filesData) {
        files = filesData.map((file) => file as OfferFile);
      }
    } catch (filesError) {
      console.error('Unexpected error fetching offer files:', filesError);
    }

    return {
      ...data,
      customer_info: data.customer_info as unknown as CustomerInfo,
      offer_details: data.offer_details as unknown as OfferDetails,
      chat_messages: data.chat_messages as unknown as ChatMessage[] | null,
      status: data.status as 'pending' | 'completed' | null,
      files
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
