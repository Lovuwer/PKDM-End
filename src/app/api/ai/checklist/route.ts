import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { plans } = await request.json();

    if (!plans || plans.length === 0) {
      return NextResponse.json({ error: 'No active plans provided' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 });
    }

    // Format context from the provided plans
    const context = plans.map((p: any, i: number) => 
      `Plan ${i + 1}: Subject: ${p.subject}, Class: ${p.class}. Objective: ${p.learningObjective}. Method: ${p.teachingMethod || 'N/A'}`
    ).join('\n');

    const prompt = `
You are an expert teaching assistant. A teacher is preparing for the upcoming week based on these lesson plans:

${context}

Your task is to generate 3 to 6 highly practical, actionable "preparation" tasks that the teacher should add to their to-do list before class begins. These should strictly be *preparation* steps, such as "Print 30 worksheets for...", "Set up the projector", "Locate science lab equipment", etc.

Return ONLY a valid JSON object matching this exact structure, with no markdown code blocks formatting or extra text:
{
  "tasks": [
    {
      "text": "The concise, actionable task description",
      "category": "Academic" 
    }
  ]
}
Category MUST be one of: "Academic", "Administrative", "Personal".
    `.trim();

    const model = genAI.getGenerativeModel({
         model: 'gemini-3.0-flash',
         generationConfig: {
             responseMimeType: "application/json",
         }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Sometimes Gemini might still output markdown block, but responseMimeType usually forces pure JSON
      const parsed = JSON.parse(text);
      return NextResponse.json({ success: true, tasks: parsed.tasks });
    } catch (parseError) {
      console.error('Failed to parse JSON from AI model:', text);
      return NextResponse.json({ error: 'AI returned invalid formatting' }, { status: 500 });
    }

  } catch (error) {
    console.error('[API /api/ai/checklist POST]', error);
    return NextResponse.json({ error: 'Failed to generate prep checklist' }, { status: 500 });
  }
}
