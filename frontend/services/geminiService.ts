
import { GoogleGenAI, Type } from "@google/genai";
import { APP_CONFIG } from '../config';

const recognitionResponseSchema = {
    type: Type.OBJECT,
    properties: {
        match: {
            type: Type.BOOLEAN,
            description: "Whether the person in the live camera capture is the same as in the profile picture."
        },
        confidence: {
            type: Type.NUMBER,
            description: "A confidence score from 0.0 to 1.0 for the match decision."
        }
    },
    required: ["match", "confidence"]
};

export const recognizeUser = async (userPhotoBase64: string, cameraFrameBase64: string): Promise<{ match: boolean, confidence: number }> => {
    // Correct initialization as per instructions: Create a new GoogleGenAI instance right before making an API call.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const prompt = `You are an advanced AI facial recognition system. Your task is to determine if two images contain the same person.
        - Image 1 is a stored user profile picture.
        - Image 2 is a live capture from a device camera.
        Analyze both images and decide if the person in Image 2 is the same as in Image 1. Respond with a JSON object indicating a match and your confidence level.`;

        const userPhotoPart = { inlineData: { mimeType: 'image/jpeg', data: userPhotoBase64.split(',')[1] } };
        const cameraFramePart = { inlineData: { mimeType: 'image/jpeg', data: cameraFrameBase64 } };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: APP_CONFIG.GEMINI_MODEL,
            contents: { parts: [textPart, userPhotoPart, cameraFramePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: recognitionResponseSchema,
                temperature: 0.1,
            }
        });
        
        const text = response.text;
        if (!text) throw new Error('Invalid response from AI service.');
        
        const parsedJson = JSON.parse(text.trim());

        if (typeof parsedJson.match === 'boolean' && typeof parsedJson.confidence === 'number') {
            return parsedJson;
        }

        throw new Error("Invalid response schema from AI service.");
    } catch (error) {
        console.error("Gemini Recognition Error:", error);
        throw new Error("Face recognition failed. Please use your email login.");
    }
};
