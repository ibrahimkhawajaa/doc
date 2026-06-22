import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateText, hasGeminiKey } from '@/lib/gemini';

const SYSTEM_PROMPT = `You are MediCare Assistant, a helpful healthcare guide AI for a Pakistani medical booking platform. You help users with:
1. Information about healthcare services
2. General medical information
3. Appointment booking guidance
4. Finding doctors and specialists in Pakistan
5. Health tips and wellness advice

Always be professional, empathetic, and encourage users to consult doctors for serious conditions.
Keep responses concise and helpful (under 150 words).
Use Pakistani context when relevant (PKR fees, cities like Karachi/Lahore).`;

function fallbackResponse(message: string): string {
  const text = message.toLowerCase();

  if (text.includes('book') || text.includes('appointment')) {
    return 'You can book an appointment from the Book page. Choose a doctor, pick a date and time, and submit the form. Need help finding a specialist? Try our AI Doctor Finder!';
  }
  if (text.includes('doctor') || text.includes('specialist')) {
    return 'Browse verified Pakistani doctors on the Doctors page or use AI Doctor Finder to match your symptoms with the right specialist.';
  }
  if (text.includes('prescription') || text.includes('analyze')) {
    return 'Upload a medical image on the Prescription Analyzer page for AI-powered insights. Always follow up with a licensed doctor for diagnosis.';
  }
  if (text.includes('hours') || text.includes('contact')) {
    return 'Visit the Contact page to send us a message, or call +92-21-111-911-911. Our team responds within 24 hours.';
  }

  return 'Thanks for reaching out! I can help with booking appointments, finding doctors, and navigating MediCare services. What would you like to do today?';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let response: string;
    let aiPowered = false;

    if (hasGeminiKey()) {
      try {
        const result = await generateText(`${SYSTEM_PROMPT}\n\nUser: ${message}`);
        response = result.text;
        aiPowered = true;
      } catch (aiError) {
        console.error('Gemini chat error:', aiError);
        response = fallbackResponse(message);
      }
    } else {
      response = fallbackResponse(message);
    }

    try {
      await prisma.chatMessage.create({
        data: {
          sessionId: sessionId || 'anonymous',
          message,
          response,
        },
      });
    } catch (dbError) {
      console.error('Chat history save error:', dbError);
    }

    return NextResponse.json({ response, aiPowered });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({
      response:
        'Sorry, I encountered an error. You can still book appointments or browse doctors from the menu.',
      aiPowered: false,
    });
  }
}
