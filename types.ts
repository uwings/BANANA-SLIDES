
export interface Slide {
  pageNumber: number;
  narrativeGoal: string;
  keyContent: string;
  visual: string;
  layout: string;
  generatedImageUrl?: string;
  isGeneratingImage?: boolean;
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
  systemPrompt: string;
  socialPrompt: string;
  styleVariables: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}

export type ViewType = 'input' | 'results';
export type ResultTabType = 'content' | 'social';
export type SettingsTabType = 'system' | 'style' | 'social' | 'image';
