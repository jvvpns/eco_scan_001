import { GoogleGenAI, Type } from '@google/genai';
import { GarbageType } from '../types';

export interface GarbageIdentificationResult {
  itemName: string;
  garbageType: GarbageType;
  points: number;
  description?: string;
  noWasteDetected: boolean;
}

const pointsMap: Record<GarbageType, number> = {
  [GarbageType.SPECIAL]: 15,
  [GarbageType.NON_BIODEGRADABLE]: 12,
  [GarbageType.BIODEGRADABLE]: 10,
  [GarbageType.RESIDUAL]: 5,
};

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            {
              // Concise prompt — strict waste-only gate, token-efficient
              text: `Is the main object in this image actual waste/garbage/trash meant for disposal? Examples of waste: bottles, wrappers, cans, food scraps, broken items, packaging. NOT waste: people, animals, furniture, electronics in use, buildings, scenery. Set isWasteItem=false if not waste. Respond JSON only.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: `You are a strict waste classification AI. Return JSON only. No markdown.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isWasteItem: { type: Type.BOOLEAN },
            itemName: { type: Type.STRING },
            garbageType: {
              type: Type.STRING,
              enum: ['Special', 'Non-Biodegradable', 'Biodegradable', 'Residual'],
            },
            description: { type: Type.STRING },
          },
          required: ['isWasteItem', 'itemName', 'garbageType'],
        },
      },
    });

    const rawText = response.text ?? '{}';
    const result = JSON.parse(rawText);

    // Gate 1: Gemini explicitly says it's not waste
    if (!result.isWasteItem) {
      return {
        itemName: result.itemName || 'Not a waste item',
        garbageType: GarbageType.RESIDUAL,
        points: 0,
        description: result.description,
        noWasteDetected: true,
      };
    }

    // Gate 2: Validate garbageType enum
    if (!Object.values(GarbageType).includes(result.garbageType)) {
      throw new Error(`Unknown garbage type: '${result.garbageType}'`);
    }

    return {
      itemName: result.itemName,
      garbageType: result.garbageType as GarbageType,
      points: pointsMap[result.garbageType as GarbageType] || 0,
      description: result.description,
      noWasteDetected: false,
    };
  } catch (error) {
    console.error('Error identifying garbage:', error);
    throw new Error('Could not identify the item. Please try again.');
  }
};