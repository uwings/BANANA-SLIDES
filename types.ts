
export interface Slide {
  pageNumber: number;
  narrativeGoal: string;
  keyContent: string;
  visual: string;
  layout: string;
  generatedImageUrl?: string;
  isGeneratingImage?: boolean;
  customStyleVariables?: string; // Override style for this specific slide
  styleKey?: StyleTemplateKey; // The style key used to generate the image
}

export interface SlideDeck {
  title: string;
  styleInstruction: string;
  summary: string;
  slides: Slide[];
  socialMedia: {
    title: string;
    intro: string;
    tags: string[];
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  userInput: string;
  deck: SlideDeck;
}

export interface AppSettings {
  apiKey: string;
  systemPrompt: string;
  socialPrompt: string;
  styleVariables: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}

export type ViewType = 'input' | 'results';
export type ResultTabType = 'content' | 'social';
export type SettingsTabType = 'system' | 'style' | 'social' | 'image' | 'apikey';
export type StyleTemplateKey = 'default' | 'minimal' | 'tech' | 'warm' | 'business' | 'creative' | 'kawaii' | 'mono' | 'film' | 'dodocotton' | 'watercolor' | 'glass' | 'allie_brosh' | 'sarah_andersen' | 'mattias_adolfsson' | 'george_barbier' | 'ivan_bilibin';
