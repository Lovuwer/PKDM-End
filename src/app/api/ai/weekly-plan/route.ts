import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI feature not configured.' }, { status: 503 });
    }

    const body = await request.json();
    const { subject, className, topic, labels } = body;

    if (!subject || !className) {
      return NextResponse.json({ error: 'Subject and class are required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    // Fallback if topic is missing
    const topicContext = topic ? `The overarching topic for this week is: "${topic}".` : 'Generate a sensible, generic introductory topic for this week.';

    const prompt = `You are an expert ${subject} teacher for Class ${className} at an Indian CISCE school (Pallikoodam).
You are drafting a weekly lesson plan.

${topicContext}

Please generate extremely high-quality, actionable, and specific content for the following 6 lesson plan fields:
1. Learning Objective: ${labels.learningObjective || 'Learning Objective'}
2. Teaching Method: ${labels.teachingMethod || 'Teaching Method'}
3. Field 1: ${labels.field1 || 'Activities'}
4. Field 2: ${labels.field2 || 'Resources'}
5. Field 3: ${labels.field3 || 'Assessment'}
6. Field 4: ${labels.field4 || 'Notes'}

IMPORTANT: Return ONLY a valid JSON object. No markdown, no explanations. 
Format:
{
  "learningObjective": "...",
  "teachingMethod": "...",
  "field1": "...",
  "field2": "...",
  "field3": "...",
  "field4": "..."
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let aiData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      aiData = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: 'AI returned unexpected format.', rawResponse: responseText }, { status: 422 });
    }

    return NextResponse.json({ success: true, aiData });
  } catch (error) {
    console.error('[API /api/ai/weekly-plan]', error);
    return NextResponse.json({ error: 'AI processing failed. Please try again.' }, { status: 500 });
  }
}
