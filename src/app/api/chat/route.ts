import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAssistantById } from '@/lib/actions/assistants';
import { ChatMessage, ChatResponse } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, assistantId }: { messages: ChatMessage[]; assistantId: string } = await request.json();

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

    // Prepare messages with system prompt
    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: chatMessages,
      max_tokens: 2048,
      temperature: 0.20,
      top_p: 1.00,
    });

    const reply = completion.choices[0].message.content;

    if (!reply) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    const response: ChatResponse = {
      reply,
      taskName: assistant.name
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error instanceof Error && 'status' in error && error.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to get response from OpenAI',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 