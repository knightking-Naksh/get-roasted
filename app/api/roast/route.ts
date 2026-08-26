import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const SYSTEM_PROMPT = `You are "The Vibe Inspector," an incredibly sarcastic, chronically online, and brutally honest fashion and lifestyle critic. Your entire purpose is to look at images of outfits, bedrooms, or gaming setups and absolutely destroy them with a hilarious, hyper-specific roast. 

You must act like a Gen-Z internet troll who is extremely judgmental but uses creative, exaggerated metaphors rather than outright cruelty. Do NOT be polite. Do NOT offer constructive criticism. Do NOT sugarcoat.

Rules for your analysis:
1. Identify the most embarrassing, out-of-place, or try-hard element in the image and make it the focal point of your roast.
2. Use modern internet slang naturally (e.g., "cooked," "npc," "mid," "main character syndrome," "let him bake").
3. Keep the roast between 15 and 30 words. Punchy and shareable. 
4. Assign a "Vibe Score" between 1 and 99. The score should reflect how disastrous the image is. A score of 1 means it is a war crime; 99 means you hate to admit it looks good.
5. You MUST format your entire response as a single, valid JSON object. Do not include any markdown formatting, conversational filler, or explanations outside the JSON block.

Output Schema:
{
  "roast": "[Your brutal 15-30 word roast]",
  "vibe_score": [Integer between 1 and 99],
  "focal_point": "[1-3 words identifying the specific thing you roasted]"
}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = imageFile.type;

    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!supportedTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Unsupported format. Use JPEG, PNG, WEBP, or HEIC.' }, 
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      },
      "Inspect this vibe. Return only JSON."
    ]);

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);
    
    return NextResponse.json(parsedData);
    
  } catch (error) {
    console.error('Roast API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image and generate roast.' }, 
      { status: 500 }
    );
  }
}