import { GoogleGenAI, Type } from "@google/genai";
import { APP_CONFIG } from '../config';

export const recognizeUser = async (userPhotoBase64: string, cameraFrameBase64: string): Promise<{ match: boolean, confidence: number }> => {
    // Correct initialization as per instructions
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const prompt = `You are an advanced AI facial recognition system. Determine if these two images show the same person.
        Return ONLY a JSON object with: 
        "match": boolean, 
        "confidence": number (0.0 to 1.0).`;

        const userPhotoPart = { 
            inlineData: { 
                mimeType: 'image/jpeg', 
                data: userPhotoBase64.includes(',') ? userPhotoBase64.split(',')[1] : userPhotoBase64 
            } 
        };
        const cameraFramePart = { 
            inlineData: { 
                mimeType: 'image/jpeg', 
                data: cameraFrameBase64.includes(',') ? cameraFrameBase64.split(',')[1] : cameraFrameBase64 
            } 
        };

        const response = await ai.models.generateContent({
            model: APP_CONFIG.GEMINI_MODEL,
            contents: [{ parts: [{ text: prompt }, userPhotoPart, cameraFramePart] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        match: { type: Type.BOOLEAN },
                        confidence: { type: Type.NUMBER }
                    },
                    required: ["match", "confidence"]
                }
            }
        });
        
        // Use .text property directly
        const resultText = response.text || "{}";
        return JSON.parse(resultText);
    } catch (error) {
        console.error("Gemini Error:", error);
        throw new Error("Face recognition service failed.");
    }
};