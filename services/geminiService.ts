import { GoogleGenAI, Type } from '@google/genai';
import { GarbageType } from '../types';

export interface GarbageIdentificationResult {
  itemName: string;
  garbageType: GarbageType;
  points: number;
  description?: string;
}

const pointsMap: Record<GarbageType, number> = {
  [GarbageType.SPECIAL]: 15,
  [GarbageType.NON_BIODEGRADABLE]: 12,
  [GarbageType.BIODEGRADABLE]: 10,
  [GarbageType.RESIDUAL]: 5,
};

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export const identifyGarbage = async (
  base64Image: string
): Promise<GarbageIdentificationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: `
Analyze ONLY the main object in the foreground.
Ignore background clutter, hands, tables, walls, or surroundings.
Classify the item into ONE of the following categories:
1. Special
2. Non-Biodegradable
3. Biodegradable
4. Residual
Respond ONLY in JSON format.
              `,
            },
          ],
        },
      ],
      config: {
        systemInstruction: `
You are an expert waste classification AI.
Return STRICT JSON only.
No markdown. No explanation outside JSON.
        `,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemName: { type: Type.STRING },
            garbageType: {
              type: Type.STRING,
              enum: ['Special', 'Non-Biodegradable', 'Biodegradable', 'Residual'],
            },
            description: { type: Type.STRING },
          },
          required: ['itemName', 'garbageType'],
        },
      },
    });

    const rawText = response.text ?? '{}';
    const result = JSON.parse(rawText);

    if (!Object.values(GarbageType).includes(result.garbageType)) {
      throw new Error(`Unknown garbage type returned: '${result.garbageType}'`);
    }

    const points = pointsMap[result.garbageType as GarbageType] || 0;

    return {
      itemName: result.itemName,
      garbageType: result.garbageType,
      points,
      description: result.description,
    };
  } catch (error) {
    console.error('Error identifying garbage:', error);
    throw new Error('Could not identify the item. Please try again.');
  }
};