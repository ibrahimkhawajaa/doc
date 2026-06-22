import { NextRequest, NextResponse } from 'next/server';
import { generateMultimodal, hasGeminiKey } from '@/lib/gemini';

function fallbackAnalysis(condition: string): string {
  return `Based on your description of "${condition}", here is a general assessment:

1. Possible conditions: This could be related to common skin irritations, allergic reactions, or minor inflammation. A physical examination is needed for accurate diagnosis.

2. General recommendations: Keep the area clean and dry, avoid scratching, and monitor for changes in size, color, or pain level.

3. When to see a doctor: Seek medical attention if symptoms worsen, spread rapidly, are accompanied by fever, or do not improve within 3-5 days.

4. Preventive measures: Maintain good hygiene, use gentle skincare products, and avoid known irritants.

Note: Add a valid GEMINI_API_KEY to your .env file for AI-powered image analysis. This response is a general guide only.`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const condition = formData.get('condition') as string;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!condition?.trim()) {
      return NextResponse.json({ error: 'Condition description is required' }, { status: 400 });
    }

    if (!hasGeminiKey()) {
      return NextResponse.json({
        prescription: fallbackAnalysis(condition),
        condition,
        mode: 'fallback',
        aiPowered: false,
      });
    }

    try {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const mimeType = file.type || 'image/jpeg';

      const prompt = `As a medical AI assistant, analyze this image of a medical condition: "${condition}".

Provide:
1. Possible conditions
2. Recommended treatments (general information only)
3. When to see a doctor (urgency level)
4. Preventive measures

Remember: This is for educational purposes only. Always recommend consulting a licensed doctor in Pakistan.`;

      const result = await generateMultimodal([
        { inlineData: { data: base64, mimeType } },
        prompt,
      ]);

      return NextResponse.json({
        prescription: result.text,
        condition,
        mode: 'ai',
        aiPowered: true,
      });
    } catch (aiError) {
      console.error('Gemini analysis error:', aiError);
      return NextResponse.json({
        prescription: fallbackAnalysis(condition),
        condition,
        mode: 'fallback',
        aiPowered: false,
      });
    }
  } catch (error) {
    console.error('Analysis Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze prescription. Please try again.' },
      { status: 500 }
    );
  }
}
