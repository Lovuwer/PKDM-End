import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'AI feature not configured. Add GEMINI_API_KEY to your environment variables.' 
      }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let extractedText = '';
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } catch {
      return NextResponse.json({ error: 'Failed to read PDF. Make sure it is a valid PDF file.' }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json({ error: 'PDF appears to be empty or too short. Try a different file.' }, { status: 400 });
    }

    // Truncate if too long (Gemini has a context limit)
    const maxChars = 30000;
    const textToSend = extractedText.length > maxChars 
      ? extractedText.substring(0, maxChars) + '\n\n[... truncated for length ...]' 
      : extractedText;

    // Call Gemini to map syllabus to academic months
    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `You are an expert academic curriculum planner for an Indian CISCE school (Pallikoodam, Chattisgarh).

Given the following syllabus/curriculum document text, create a detailed week-by-week breakdown for an academic year from June to March (10 months, 4 weeks each = 40 weeks total).

For each week, provide a brief description of what topics/chapters should be covered that week.

IMPORTANT: Return ONLY a valid JSON object with NO markdown formatting, NO code fences, NO explanation. Just the raw JSON.

The JSON format must be exactly:
{
  "June_1": "Topic for June Week 1",
  "June_2": "Topic for June Week 2", 
  "June_3": "Topic for June Week 3",
  "June_4": "Topic for June Week 4",
  "July_1": "Topic for July Week 1",
  ... and so on through ...
  "March_4": "Topic for March Week 4"
}

The months are: June, July, August, September, October, November, December, January, February, March

Here is the syllabus text:

${textToSend}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON from AI response
    let draftData: Record<string, string>;
    try {
      // Try to extract JSON from potential markdown code fences
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      draftData = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ 
        error: 'AI returned unexpected format. Please try again.',
        rawResponse: responseText.substring(0, 500)
      }, { status: 422 });
    }

    // Validate keys
    const months = ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    const validKeys = months.flatMap(m => [1,2,3,4].map(w => `${m}_${w}`));
    const filtered: Record<string, string> = {};
    for (const key of validKeys) {
      filtered[key] = draftData[key] || '';
    }

    return NextResponse.json({ success: true, draftData: filtered });
  } catch (error) {
    console.error('[API /api/ai/parse-syllabus]', error);
    return NextResponse.json({ error: 'AI processing failed. Please try again.' }, { status: 500 });
  }
}
