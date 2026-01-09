
import { GoogleGenAI, Type } from "@google/genai";
import { SlideDeck } from "../types";

// Generate the narrative structure and content for the slide deck
export const generateSlideDeck = async (fullPrompt: string): Promise<SlideDeck> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullPrompt,
      config: {
        // Significantly increase tokens to handle 30+ slides and complex JSON
        maxOutputTokens: 16384,
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            styleInstruction: { type: Type.STRING },
            summary: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pageNumber: { type: Type.NUMBER },
                  narrativeGoal: { type: Type.STRING },
                  keyContent: { type: Type.STRING },
                  visual: { type: Type.STRING },
                  layout: { type: Type.STRING },
                },
                required: ["pageNumber", "narrativeGoal", "keyContent", "visual", "layout"]
              }
            },
            socialMedia: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                intro: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          required: ["title", "styleInstruction", "summary", "slides", "socialMedia"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    try {
      // Clean up the text in case there's any stray markdown or whitespace
      const cleanedJson = text.trim();
      return JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw Text:", text);
      throw new Error("内容生成过于庞大导致格式受损，请尝试缩减输入内容或分段生成。");
    }
  } catch (apiError: any) {
    if (apiError?.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_EXPIRED");
    }
    throw apiError;
  }
};

// Generate an image using a pre-constructed prompt with gemini-3-pro-image-preview
export const generateSlideImage = async (
  finalPrompt: string, 
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1"
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [{ parts: [{ text: finalPrompt }] }],
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error: any) {
    if (error?.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_EXPIRED");
    }
    throw error;
  }
};
