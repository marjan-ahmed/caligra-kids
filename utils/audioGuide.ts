import { GoogleGenAI } from "@google/genai";

export async function generateAudioGuide(letter: string, brushType: string, mode: string) {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.error("Missing Gemini API Key");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

  let textToSay = "";
  if (mode === "Beginner") {
    textToSay = `Great job! Keep practicing the letter ${letter}! Follow the glowing trail.`;
  } else {
    textToSay = `Excellent work on the letter ${letter}! Remember to control your pressure with the ${brushType} tool.`;
  }
  const prompt = `Say cheerfully: ${textToSay}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["AUDIO"],
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
