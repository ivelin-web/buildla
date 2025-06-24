import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getAssistantById } from '@/lib/actions/assistants';
import { getModelSettings } from '@/lib/actions/model-settings';

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

    // Use streamText from AI SDK
    const result = streamText({
      model: openai(settings.model),
      system: systemPrompt,
      messages,
      maxTokens: settings.max_tokens,
      temperature: settings.temperature,
      topP: settings.top_p,
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