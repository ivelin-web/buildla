import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getAssistantById } from '@/lib/actions/assistants';
import { getModelSettings } from '@/lib/actions/model-settings';
import { createOffer } from '@/lib/actions/offers';
import { searchFAQ } from '@/lib/faq-search';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { 
      messages, 
      assistantId, 
      modelSettings 
    } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    if (!assistantId) {
      return NextResponse.json(
        { error: 'Assistant ID is required' },
        { status: 400 }
      );
    }

    // Get assistant from database
    let assistant;
    try {
      assistant = await getAssistantById(assistantId);
    } catch {
      return NextResponse.json(
        { error: 'Assistant not found' },
        { status: 404 }
      );
    }

    // Get the system prompt for the selected assistant
    const systemPrompt = assistant.system_prompt;

    // Get model settings (use provided settings or fetch from database)
    let settings = modelSettings;
    if (!settings) {
      try {
        settings = await getModelSettings();
      } catch (error) {
        console.error('Failed to get model settings, using defaults:', error);
        settings = {
          id: 'default',
          model: 'gpt-4.1-nano' as const,
          temperature: 0.20,
          max_tokens: 2048,
          top_p: 1.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }

    // Define the offer tool
    const saveOfferTool = tool({
      description: 'Save bathroom renovation offer to database. ONLY call this AFTER you have already shown the complete price breakdown to the user AND collected their contact details.',
      parameters: z.object({
        customerInfo: z.object({
          name: z.string().min(1),
          email: z.string().min(1),
          phone: z.string().min(1),
        }),
        offerDetails: z.object({
          area: z.number(),
          form: z.string(),
          builtBefore1950: z.boolean(),
          tileType: z.string(),
          builtInDetails: z.number(),
          parkingZone: z.number().nullable(),
          rotPersons: z.number(),
          laborCost: z.number(),
          materialCost: z.number(),
          transportCost: z.number(),
          parkingCost: z.number(),
          rotDeduction: z.number(),
          totalIncVat: z.number(),
        }),
      }),
      execute: async ({ customerInfo, offerDetails }) => {
        try {
          const result = await createOffer({
            assistantId,
            customerInfo,
            offerDetails,
            chatMessages: messages
          });
          
          if (result.success) {
            return { 
              success: true, 
              offerId: result.offerId,
              message: 'Perfect! Your bathroom renovation quote has been prepared and saved. Thank you for choosing Buildla! Your detailed quote will be processed and you can expect to hear from us soon.'
            };
          } else {
            console.error('Failed to save offer:', result.error);
            return { 
              success: false, 
              error: result.error || 'Failed to save offer'
            };
          }
        } catch (error) {
          console.error('Error in saveOffer tool:', error);
          return { 
            success: false, 
            error: 'Internal error while saving offer'
          };
        }
      },
    });

    // Define the FAQ search tool
    const searchFAQTool = tool({
      description: 'Search FAQ database for relevant construction and renovation information. Use this when users ask questions about general construction, renovation techniques, materials, or related topics.',
      parameters: z.object({
        query: z.string().min(1).describe('The user question or search query to find relevant FAQ content'),
      }),
      execute: async ({ query }) => {
        try {
          const result = await searchFAQ(query, 5, 0.7);
          
          if (result.success && result.results && result.results.length > 0) {
            return {
              success: true,
              results: result.results.map(item => ({
                content: item.content,
                title: item.title,
                url: item.url,
                similarity: Math.round(item.similarity * 100),
                source: item.source_website
              })),
              message: `Found ${result.results.length} relevant FAQ entries. Use this information to answer the user's question and include source citations from the URLs provided.`
            };
          } else {
            return {
              success: false,
              message: result.error || 'No relevant FAQ content found for this query. Please provide a helpful response based on your general knowledge.'
            };
          }
        } catch (error) {
          console.error('Error in searchFAQ tool:', error);
          return {
            success: false,
            message: 'FAQ search is temporarily unavailable. Please provide a helpful response based on your general knowledge.'
          };
        }
      },
    });

    // Use streamText from AI SDK with tools
    const result = streamText({
      model: openai(settings.model),
      system: systemPrompt,
      messages,
      maxTokens: settings.max_tokens,
      temperature: settings.temperature,
      topP: settings.top_p,
      tools: {
        saveOffer: saveOfferTool,
        searchFAQ: searchFAQTool,
      },
      maxSteps: 3, // Enable multi-step generation to allow text response after tool execution
      onError: (error) => {
        console.error('streamText error:', error);
      }
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('AI API Error:', error);
    
    if (error instanceof Error && 'status' in error && error.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to get response from AI',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 