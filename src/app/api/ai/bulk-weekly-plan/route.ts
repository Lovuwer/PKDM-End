import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI feature not configured.' }, { status: 503 });
    }

    const { userId, subject, className, weeksToGenerate, labels } = await request.json();

    if (!userId || !subject || !className || !weeksToGenerate || !Array.isArray(weeksToGenerate)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (weeksToGenerate.length === 0) {
      return NextResponse.json({ success: true, message: 'No missing weeks to generate.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    // Format the prompt for bulk generation
    const weeksListStr = weeksToGenerate.map(w => 
      `- ${w.academicMonth}_${w.weekNum} (Dates: ${w.startDate} to ${w.endDate}): Topic is "${w.topic}"`
    ).join('\n');

    const prompt = `You are an expert ${subject} teacher for Class ${className} at an Indian CISCE school (Pallikoodam).
You are drafting a bulk set of weekly lesson plans for the following specific weeks and topics:

${weeksListStr}

Please generate extremely high-quality, actionable, and specific content for these ${weeksToGenerate.length} weeks.
For EACH week, provide these exactly 6 fields:
1. learningObjective: (What is the goal? based on ${labels?.learningObjective || 'Learning Objective'})
2. teachingMethod: (How to teach it? based on ${labels?.teachingMethod || 'Teaching Method'})
3. field1: (${labels?.field1 || 'Activities'})
4. field2: (${labels?.field2 || 'Resources'})
5. field3: (${labels?.field3 || 'Assessment'})
6. field4: (${labels?.field4 || 'Notes'})

IMPORTANT: Return ONLY a valid JSON object. No markdown, no explanations.
The JSON format MUST be an object mapped by the exact week string identifiers provided above (e.g. "June_1", "June_2").
Inside each week identifier, provide the 6 fields as an object.

Example Format:
{
  "June_1": {
    "learningObjective": "...",
    "teachingMethod": "...",
    "field1": "...",
    "field2": "...",
    "field3": "...",
    "field4": "..."
  },
  "June_2": {
    ...
  }
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let aiData: Record<string, Record<string, string>>;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      aiData = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: 'AI returned unexpected format.', rawResponse: responseText }, { status: 422 });
    }

    // Prepare and insert into database
    const plansToCreate = [];
    
    for (const week of weeksToGenerate) {
      const weekId = `${week.academicMonth}_${week.weekNum}`;
      const generatedContent = aiData[weekId];
      
      if (generatedContent) {
        plansToCreate.push({
          userId,
          class: className,
          subject,
          startDate: new Date(week.startDate),
          endDate: new Date(week.endDate),
          learningObjective: generatedContent.learningObjective || '',
          teachingMethod: generatedContent.teachingMethod || '',
          field1: generatedContent.field1 || '',
          field2: generatedContent.field2 || '',
          field3: generatedContent.field3 || '',
          field4: generatedContent.field4 || '',
          status: 'DRAFT' as const,
          isCompleted: false
        });
      }
    }

    if (plansToCreate.length > 0) {
      // Workaround for lack of unique identifier: use createMany instead
      await prisma.weeklyPlan.createMany({
         data: plansToCreate,
         skipDuplicates: true // Does nothing without unique constraint, but safe
      });
    }

    return NextResponse.json({ success: true, createdCount: plansToCreate.length });
  } catch (error) {
    console.error('[API /api/ai/bulk-weekly-plan]', error);
    return NextResponse.json({ error: 'Bulk AI processing failed. Please try again.' }, { status: 500 });
  }
}
