import { NextResponse } from 'next/server';
import { getAssistants } from '@/lib/actions/assistants';

export async function GET() {
  try {
    const assistants = await getAssistants();
    return NextResponse.json({ assistants });
  } catch (error) {
    console.error('Assistants API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 