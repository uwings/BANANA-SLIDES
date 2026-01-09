
import { AppSettings } from "../types";

/**
 * Constructs the final prompt for slide deck generation by injecting
 * user input and style variables into the system prompt template.
 */
export const buildDeckPrompt = (userInput: string, settings: AppSettings): string => {
  return settings.systemPrompt
    .replace('{styleVariables}', settings.styleVariables)
    .replace('{userInput}', userInput);
};

/**
 * Constructs the visual prompt for a specific slide by combining 
 * the overall style instructions with slide-specific visual and layout cues.
 */
export const buildImagePrompt = (styleInstruction: string, visual: string, layout: string, aspectRatio: string): string => {
  return `
  STRICT STYLE CONTEXT:
  ${styleInstruction}

  SLIDE SPECIFIC VISUAL TASK:
  Visual Content: ${visual}
  Layout Recommendation: ${layout}
  Required Aspect Ratio: ${aspectRatio}
  
  Generate a professional high-quality illustration image following the exact aesthetic described above. 
  The composition must strictly respect the ${aspectRatio} aspect ratio.
  Ensure any text within the image is legible and professional.
  `;
};
