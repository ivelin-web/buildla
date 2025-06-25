import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getAssistantById } from '@/lib/actions/assistants';
import { getModelSettings } from '@/lib/actions/model-settings';
import { createOffer } from '@/lib/actions/offers';

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
              message: 'Offer has been successfully saved to the database. You can now proceed to show the completion message to the user.'
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
      },
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