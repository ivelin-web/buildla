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
  threshold: number = 0.5
): Promise<{ success: boolean; results?: FAQSearchResult[]; error?: string }> {
  try {
    if (!query.trim()) {
      console.log('❌ FAQ Search: Empty query provided');
      return { success: false, error: 'Query cannot be empty' };
    }

    console.log(`🔍 FAQ Search: Starting search for query: "${query}"`);
    console.log(`📊 FAQ Search: Using threshold ${threshold} and limit ${limit}`);

    // Initialize OpenAI client
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return { success: false, error: 'OpenAI API key not configured' };
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    // Generate embedding for the query
    console.log('🔄 FAQ Search: Generating embedding for query...');
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query.trim(),
      encoding_format: 'float',
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log(`✅ FAQ Search: Generated embedding with ${queryEmbedding.length} dimensions`);

    // Search for similar content in Supabase using the PostgreSQL function
    console.log('🔄 FAQ Search: Searching database for similar content...');
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('search_faq_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit
    });

    if (error) {
      console.error('❌ FAQ Search: Error searching FAQ embeddings:', error);
      return { success: false, error: 'Failed to search FAQ database' };
    }

    if (!data || data.length === 0) {
      console.log('⚠️ FAQ Search: No results found above threshold');
      console.log(`📊 FAQ Search: 0 results returned (threshold: ${threshold})`);
      return { 
        success: true, 
        results: [],
        error: 'No relevant FAQ content found for your query'
      };
    }

    console.log(`✅ FAQ Search: Found ${data.length} results above threshold`);
    
    // Log similarity scores for debugging
    data.forEach((item, index) => {
      console.log(`📊 FAQ Search: Result ${index + 1} - Similarity: ${(item.similarity * 100).toFixed(1)}% - Title: "${item.title || 'No title'}"`);
    });

    // Format results - data is already properly typed from the RPC function
    const results: FAQSearchResult[] = data.map(item => ({
      content: item.content,
      title: item.title,
      url: item.url,
      similarity: item.similarity,
      source_website: item.source_website
    }));

    console.log(`🎯 FAQ Search: Returning ${results.length} formatted results`);
    return { success: true, results };

  } catch (error) {
    console.error('❌ FAQ Search: Error in FAQ search:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}