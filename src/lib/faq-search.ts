'use server';

import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

export interface FAQSearchResult {
  content: string;
  title: string | null;
  url: string;
  similarity: number;
  source_website: string | null;
}

export async function searchFAQ(
  query: string,
  limit: number = 5,
  threshold: number = 0.65
): Promise<{ success: boolean; results?: FAQSearchResult[]; error?: string }> {
  try {
    if (!query.trim()) {
      return { success: false, error: 'Query cannot be empty' };
    }

    // Initialize OpenAI client
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return { success: false, error: 'OpenAI API key not configured' };
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query.trim(),
      encoding_format: 'float',
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search for similar content in Supabase using the PostgreSQL function
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('search_faq_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit
    });

    if (error) {
      console.error('Error searching FAQ embeddings:', error);
      return { success: false, error: 'Failed to search FAQ database' };
    }

    if (!data || data.length === 0) {
      return { 
        success: true, 
        results: [],
        error: 'No relevant FAQ content found for your query'
      };
    }

    // Format results - data is already properly typed from the RPC function
    const results: FAQSearchResult[] = data.map(item => ({
      content: item.content,
      title: item.title,
      url: item.url,
      similarity: item.similarity,
      source_website: item.source_website
    }));

    return { success: true, results };

  } catch (error) {
    console.error('Error in FAQ search:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}