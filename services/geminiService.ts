import { GarbageType } from '../types';

export interface GarbageIdentificationResult {
  itemName: string;
  garbageType: GarbageType;
  points: number;
  description?: string;
}

// Same point system (kept)
const pointsMap: Record<GarbageType, number> = {
  [GarbageType.SPECIAL]: 15,
  [GarbageType.NON_BIODEGRADABLE]: 12,
  [GarbageType.BIODEGRADABLE]: 10,
  [GarbageType.RESIDUAL]: 5,
};

export const identifyGarbage = async (
  base64Image: string
): Promise<GarbageIdentificationResult> => {
  try {
    const response = await fetch(
      "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/identify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Identification service failed.");
    }

    const apiResult = await response.json();

    if (!Object.values(GarbageType).includes(apiResult.garbageType)) {
      throw new Error(
        `Unknown garbage type returned: '${apiResult.garbageType}'.`
      );
    }

    const points =
      pointsMap[apiResult.garbageType as GarbageType] || 0;

    return {
      itemName: apiResult.itemName,
      garbageType: apiResult.garbageType,
      points,
      description: apiResult.description,
    };
  } catch (error) {
    console.error("Error identifying garbage:", error);

    throw new Error(
      "Could not identify the item. Please try again."
    );
  }
};