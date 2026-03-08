import { GoogleGenAI, Modality } from "@google/genai";

export async function generateAudioGuide(letter: string, brushType: string, mode: string) {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.error("Missing Gemini API Key");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

  const prompt = `You are a joyful kindergarten teacher. The user is practicing the letter '${letter}' using a '${brushType}' tool. 
  Provide a short, encouraging 1-2 sentence real-time audio guide. 
  Mode: ${mode}. 
  If Beginner: Focus on basic stroke order, direction, and simple encouragement.
  If Advanced: Focus on pressure control, angle, flow, and nuanced technique for the specific tool.
  Keep it brief, warm, and conversational. Do not use markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Warm voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;
    return { base64Audio, mimeType };
  } catch (error) {
    console.error("Error generating audio guide:", error);
    return null;
  }
}
