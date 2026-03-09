import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";

admin.initializeApp();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export const identify = functions.https.onRequest(async (req, res) => {
    try {
        // Verify Firebase Auth token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }

        if (req.method !== "POST") {
            res.status(405).json({ error: "Method not allowed" });
            return;
        }

        const { image } = req.body;

        if (!image) {
            res.status(400).json({ error: "Image is required" });
            return;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: image,
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
No markdown.
No explanation outside JSON.
`,

                responseMimeType: "application/json",

                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        itemName: { type: Type.STRING },
                        garbageType: {
                            type: Type.STRING,
                            enum: [
                                "Special",
                                "Non-Biodegradable",
                                "Biodegradable",
                                "Residual",
                            ],
                        },
                        description: { type: Type.STRING },
                    },
                    required: ["itemName", "garbageType"],
                },
            },
        });

        const result = JSON.parse(response.text);

        res.status(200).json(result);
    } catch (error) {
        console.error("Gemini error:", error);
        res.status(500).json({
            error: "Failed to identify item",
        });
    }
});