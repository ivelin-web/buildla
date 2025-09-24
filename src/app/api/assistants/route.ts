import { NextResponse } from 'next/server';
import { getAssistants, getPublicAssistants } from '@/lib/actions/assistants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isWidget = searchParams.get('widget') === 'true';

    // If this is a widget request, only return public assistants
    const assistants = isWidget ? await getPublicAssistants() : await getAssistants();

    return NextResponse.json({ assistants });
  } catch (error) {
    console.error('Assistants API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 