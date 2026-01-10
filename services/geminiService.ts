
import { GoogleGenAI, Type } from "@google/genai";
import { SlideDeck, AppSettings } from "../types";

// Progress log messages for long-running operations
const PROGRESS_LOGS = {
  thinking: [
    "正在分析您输入的内容...",
    "正在构建叙事结构...",
    "正在设计幻灯片大纲...",
    "正在生成视觉提示词...",
    "正在优化文案内容...",
    "正在整理营销标签...",
  ],
  generating: [
    "正在准备生成图像...",
    "正在渲染页面...",
    "正在优化视觉效果...",
    "即将完成..."
  ]
};

let logIndex = 0;

function getNextProgressLog(phase: 'thinking' | 'generating'): string {
  const logs = PROGRESS_LOGS[phase];
  const log = logs[logIndex % logs.length];
  logIndex++;
  return log;
}

export interface GenerateOptions {
  onProgress?: (message: string) => void;
}

// Generate the narrative structure and content for the slide deck (without social media)
export const generateSlideDeck = async (
  fullPrompt: string,
  apiKey: string,
  options: GenerateOptions = {}
): Promise<SlideDeck> => {
  const { onProgress } = options;
  const ai = new GoogleGenAI({ apiKey });

  logIndex = 0;

  // Progress simulation during API call
  let progressInterval = onProgress ? setInterval(() => {
    onProgress(getNextProgressLog('thinking'));
  }, 2000) : null;

  try {
    const slidesResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullPrompt,
      config: {
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
            }
          },
          required: ["title", "styleInstruction", "summary", "slides"]
        }
      }
    });

    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    const slidesText = slidesResponse.text;
    if (!slidesText) throw new Error("Empty response from AI");

    // Parse slides content
    let slidesResult;
    try {
      slidesResult = JSON.parse(slidesText.trim());
    } catch (parseError) {
      console.error("JSON Parse Error for Slides. Raw Text:", slidesText);
      const recovered = tryRecoverJson(slidesText);
      if (recovered) {
        slidesResult = recovered;
      } else {
        throw new Error("幻灯片内容解析失败");
      }
    }

    // Ensure slides array exists
    if (!slidesResult.slides || !Array.isArray(slidesResult.slides)) {
      slidesResult.slides = [];
    }

    // Return result WITHOUT social media (will be generated separately)
    return {
      title: slidesResult.title || '未命名',
      styleInstruction: slidesResult.styleInstruction || '',
      summary: slidesResult.summary || '',
      slides: slidesResult.slides,
      socialMedia: {
        title: '',
        intro: '',
        tags: []
      }
    };
  } catch (apiError: any) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    if (apiError?.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_EXPIRED");
    }
    throw apiError;
  }
};

// Generate social media content from slide deck content (extracts title, summary, and all slide content)
export const generateSocialMediaFromSlides = async (
  socialPrompt: string,
  deck: SlideDeck,
  apiKey: string,
  options: GenerateOptions = {}
): Promise<SlideDeck['socialMedia']> => {
  const { onProgress } = options;
  const ai = new GoogleGenAI({ apiKey });

  // Build comprehensive content from slide deck for social media generation
  const slidesContent = deck.slides.map((s: any, i: number) =>
    `【第${i + 1}页】${s.narrativeGoal || ''}\n内容：${s.keyContent || ''}`
  ).join('\n\n');

  // Build the full prompt for social media
  const fullSocialPrompt = `你是一位专业的小红书内容创作者。基于以下幻灯片内容，生成适合在小红书（Xiaohongshu）发布的推广内容。

## 幻灯片完整内容

### 整体标题
${deck.title || '无标题'}

### 整体介绍
${deck.summary || '无介绍'}

### 各页幻灯片内容
${slidesContent}

---
${socialPrompt}`;

  // Debug: Log the full social media prompt
  console.log('='.repeat(70));
  console.log('[SOCIAL MEDIA PROMPT DEBUG - FROM SLIDES]');
  console.log('Prompt Length:', fullSocialPrompt.length, 'characters');
  console.log('-'.repeat(70));
  console.log(fullSocialPrompt);
  console.log('='.repeat(70));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullSocialPrompt,
      config: {
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            intro: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "intro", "tags"]
        }
      }
    });

    const text = response.text;
    console.log('[SOCIAL MEDIA RAW RESPONSE]:', text);

    if (!text) {
      return { title: deck.title || '未命名', intro: deck.summary || '', tags: [] };
    }

    try {
      const result = JSON.parse(text.trim());
      console.log('[SOCIAL MEDIA PARSED RESULT]:', JSON.stringify(result, null, 2));
      return {
        title: result.title || deck.title || '未命名',
        intro: result.intro || deck.summary || '',
        tags: Array.isArray(result.tags) && result.tags.length === 5
          ? result.tags
          : ['待补充', '待补充', '待补充', '待补充', '待补充']
      };
    } catch (parseError) {
      console.error("JSON Parse Error for Social. Raw Text:", text);
      return { title: deck.title || '未命名', intro: deck.summary || '', tags: [] };
    }
  } catch (error) {
    console.error("Social Media Generation Error:", error);
    throw error;
  }
};

// Generate social media content from original user input
export const generateSocialMediaFromInput = async (
  socialPrompt: string,
  userInput: string,
  deck: SlideDeck,
  apiKey: string,
  options: GenerateOptions = {}
): Promise<SlideDeck['socialMedia']> => {
  const { onProgress } = options;
  const ai = new GoogleGenAI({ apiKey });

  // Build the full prompt using original user input
  const fullSocialPrompt = `你是一位专业的小红书内容创作者。基于以下原始内容，生成适合在小红书（Xiaohongshu）发布的推广内容。

## 原始输入内容
${userInput.substring(0, 3000)}

## 幻灯片信息
标题：${deck.title || '无标题'}
摘要：${deck.summary || '无摘要'}

---
${socialPrompt}`;

  // Debug: Log the full social media prompt from original input
  console.log('='.repeat(70));
  console.log('[SOCIAL MEDIA PROMPT DEBUG - FROM ORIGINAL INPUT]');
  console.log('Prompt Length:', fullSocialPrompt.length, 'characters');
  console.log('-'.repeat(70));
  console.log(fullSocialPrompt);
  console.log('='.repeat(70));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullSocialPrompt,
      config: {
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            intro: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "intro", "tags"]
        }
      }
    });

    const text = response.text;
    console.log('[SOCIAL MEDIA RAW RESPONSE]:', text);

    if (!text) {
      return { title: deck.title || '未命名', intro: deck.summary || '', tags: [] };
    }

    try {
      const result = JSON.parse(text.trim());
      console.log('[SOCIAL MEDIA PARSED RESULT]:', JSON.stringify(result, null, 2));
      return {
        title: result.title || deck.title || '未命名',
        intro: result.intro || deck.summary || '',
        tags: Array.isArray(result.tags) && result.tags.length === 5
          ? result.tags
          : ['待补充', '待补充', '待补充', '待补充', '待补充']
      };
    } catch (parseError) {
      console.error("JSON Parse Error for Social. Raw Text:", text);
      return { title: deck.title || '未命名', intro: deck.summary || '', tags: [] };
    }
  } catch (error) {
    console.error("Social Media Generation Error:", error);
    throw error;
  }
};

// Generate an image using a pre-constructed prompt with gemini-3-pro-image-preview
export const generateSlideImage = async (
  finalPrompt: string,
  apiKey: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1",
  options: GenerateOptions = {}
): Promise<string> => {
  const { onProgress } = options;
  const ai = new GoogleGenAI({ apiKey });

  // Debug: Log the full prompt to console
  console.log('='.repeat(60));
  console.log('[IMAGE PROMPT DEBUG]');
  console.log('Aspect Ratio:', aspectRatio);
  console.log('Prompt Length:', finalPrompt.length, 'characters');
  console.log('-'.repeat(60));
  console.log(finalPrompt);
  console.log('='.repeat(60));

  logIndex = 0;

  // Progress simulation during image generation
  const progressInterval = onProgress ? setInterval(() => {
    onProgress(getNextProgressLog('generating'));
  }, 3000) : null;

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

    if (progressInterval) {
      clearInterval(progressInterval);
    }

    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error: any) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    if (error?.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_EXPIRED");
    }
    throw error;
  }
};

// Test if an API key is valid
export const testApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Try to list models to verify the key works
    await ai.models.list();
    return true;
  } catch {
    return false;
  }
};

// Helper function to find matching closing bracket
function findMatchingClose(text: string, startIndex: number, openChar: string, closeChar: string): number {
  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === openChar) {
        depth++;
      } else if (char === closeChar) {
        depth--;
        if (depth === 0) {
          return i;
        }
      }
    }
  }

  return -1;
}

// Helper function to strip markdown and trailing text after valid JSON
function stripTrailingMarkdown(text: string): string {
  // Remove markdown code block markers
  let cleaned = text;

  // Check for markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }

  // Find the first { and the matching }
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace !== -1) {
    // Find the matching close brace for the root object
    const closeIndex = findMatchingClose(cleaned, firstBrace, '{', '}');
    if (closeIndex !== -1) {
      // Only keep content up to and including the closing brace
      cleaned = cleaned.substring(0, closeIndex + 1);
    }
  }

  return cleaned.trim();
}

// Helper function to try recovering truncated JSON
function tryRecoverJson(text: string): SlideDeck | null {
  try {
    const jsonText = stripTrailingMarkdown(text);
    const result = JSON.parse(jsonText);

    // Validate minimum required fields
    if (!result || typeof result !== 'object') {
      return null;
    }

    if (!result.title || typeof result.title !== 'string') {
      return null;
    }

    // Ensure slides is an array
    if (!result.slides || !Array.isArray(result.slides)) {
      result.slides = [];
    }

    // Handle corrupted socialMedia - try to extract from other fields
    if (!result.socialMedia || typeof result.socialMedia !== 'object' || result.socialMedia === null) {
      result.socialMedia = {
        title: result.title || '未命名',
        intro: result.summary || '',
        tags: []
      };
    } else {
      // Ensure socialMedia fields exist and are valid
      if (!result.socialMedia.title || typeof result.socialMedia.title !== 'string') {
        result.socialMedia.title = result.title || '未命名';
      }
      if (!result.socialMedia.intro || typeof result.socialMedia.intro !== 'string') {
        result.socialMedia.intro = result.summary || '';
      }
      if (!result.socialMedia.tags || !Array.isArray(result.socialMedia.tags)) {
        result.socialMedia.tags = [];
      }
      // Ensure exactly 5 tags
      if (result.socialMedia.tags.length !== 5) {
        result.socialMedia.tags = result.socialMedia.tags.slice(0, 5);
        while (result.socialMedia.tags.length < 5) {
          result.socialMedia.tags.push('待补充');
        }
      }
    }

    // Clean up slides to ensure they have required fields
    result.slides = (result.slides || []).map((slide: any, index: number) => ({
      pageNumber: slide.pageNumber || index + 1,
      narrativeGoal: slide.narrativeGoal || '未完成的幻灯片',
      keyContent: slide.keyContent || '内容待补充',
      visual: slide.visual || '请重新生成此页',
      layout: slide.layout || '标准布局'
    }));

    return result;
  } catch {
    return null;
  }
}

// ============================================================
// 信息图模式生成函数（分段生成策略）
// ============================================================

// 信息图大纲接口定义
interface InfographicOutline {
  title: string;
  styleInstruction: string;
  summary: string;
  tableOfContents: string[];
  chapters: Array<{
    chapterNumber: number;
    chapterTitle: string;
    keyPoints: string[];
  }>;
}

// 1. 生成信息图大纲
export const generateInfographicOutline = async (
  userInput: string,
  apiKey: string,
  settings: AppSettings,
  options: GenerateOptions = {}
): Promise<InfographicOutline> => {
  const { onProgress } = options;
  const ai = new GoogleGenAI({ apiKey });
  const fullPrompt = settings.infographicOutlinePrompt.replace('{userInput}', userInput);

  // Debug: Log the full prompt to console
  console.log('='.repeat(60));
  console.log('[INFOGRAPHIC OUTLINE PROMPT DEBUG]');
  console.log('Prompt Length:', fullPrompt.length, 'characters');
  console.log('-'.repeat(60));
  console.log(fullPrompt);
  console.log('='.repeat(60));

  logIndex = 0;

  // Progress during outline generation
  const progressInterval = onProgress ? setInterval(() => {
    onProgress(getNextProgressLog('thinking'));
  }, 3000) : null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullPrompt,
      config: {
        maxOutputTokens: 8192,  // 大纲不需要太多 token
        thinkingConfig: { thinkingBudget: 2000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            styleInstruction: { type: Type.STRING },
            summary: { type: Type.STRING },
            tableOfContents: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chapterNumber: { type: Type.NUMBER },
                  chapterTitle: { type: Type.STRING },
                  keyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["chapterNumber", "chapterTitle", "keyPoints"]
              }
            }
          },
          required: ["title", "styleInstruction", "summary", "tableOfContents", "chapters"]
        }
      }
    });

    if (progressInterval) {
      clearInterval(progressInterval);
    }

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    console.log('[INFOGRAPHIC OUTLINE RESPONSE]');
    console.log(text);
    console.log('='.repeat(60));

    let result: InfographicOutline;
    try {
      result = JSON.parse(text.trim());
    } catch (parseError) {
      console.error("JSON Parse Error for Infographic Outline. Raw Text:", text);
      throw new Error("信息图大纲解析失败");
    }

    // Validate result
    if (!result.chapters || result.chapters.length === 0) {
      throw new Error("大纲生成失败：未返回有效章节");
    }

    return result;
  } catch (apiError: any) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    if (apiError?.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_EXPIRED");
    }
    throw apiError;
  }
};

// 2. 生成详细信息图卡片
export const generateInfographicDetails = async (
  outline: InfographicOutline,
  apiKey: string,
  settings: AppSettings,
  options: GenerateOptions = {}
): Promise<SlideDeck> => {
  const { onProgress } = options;
  const ai = new GoogleGenAI({ apiKey });

  // 构建大纲描述
  const chaptersText = outline.chapters.map(ch =>
    `${ch.chapterNumber}. ${ch.chapterTitle}\n要点：${ch.keyPoints.join('; ')}`
  ).join('\n\n');

  const fullPrompt = settings.infographicDetailPrompt
    .replace('{title}', outline.title)
    .replace('{styleInstruction}', outline.styleInstruction)
    .replace('{outline_chapters}', chaptersText);

  // Debug: Log the full prompt to console
  console.log('='.repeat(60));
  console.log('[INFOGRAPHIC DETAIL PROMPT DEBUG]');
  console.log('Prompt Length:', fullPrompt.length, 'characters');
  console.log('-'.repeat(60));
  console.log(fullPrompt);
  console.log('='.repeat(60));

  logIndex = 0;

  // Progress during detail generation
  const progressInterval = onProgress ? setInterval(() => {
    onProgress(getNextProgressLog('thinking'));
  }, 3000) : null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullPrompt,
      config: {
        maxOutputTokens: 16384,
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pageNumber: { type: Type.NUMBER },
                  narrativeGoal: { type: Type.STRING },
                  keyContent: { type: Type.STRING },
                  visual: { type: Type.STRING },
                  layout: { type: Type.STRING }
                },
                required: ["pageNumber", "narrativeGoal", "keyContent", "visual", "layout"]
              }
            }
          },
          required: ["slides"]
        }
      }
    });

    if (progressInterval) {
      clearInterval(progressInterval);
    }

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    console.log('[INFOGRAPHIC DETAIL RESPONSE]');
    console.log(text);
    console.log('='.repeat(60));

    let result: { slides: any[] };
    try {
      result = JSON.parse(text.trim());
    } catch (parseError) {
      console.error("JSON Parse Error for Infographic Details. Raw Text:", text);
      throw new Error("信息图详细内容解析失败");
    }

    // Validate result
    if (!result.slides || result.slides.length === 0) {
      throw new Error("详细内容生成失败：未返回有效卡片");
    }

    return {
      title: outline.title,
      styleInstruction: outline.styleInstruction,
      summary: outline.summary,
      slides: result.slides,
      socialMedia: { title: '', intro: '', tags: [] }  // 稍后生成
    };
  } catch (apiError: any) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    if (apiError?.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_EXPIRED");
    }
    throw apiError;
  }
};

// 3. 完整的信息图生成流程（封装前两步）
export const generateInfographicDeck = async (
  userInput: string,
  apiKey: string,
  settings: AppSettings,
  options: GenerateOptions = {}
): Promise<SlideDeck> => {
  const { onProgress } = options;

  try {
    // 第一步：生成大纲
    onProgress?.("正在分析内容结构...");
    const outline = await generateInfographicOutline(userInput, apiKey, settings, options);

    onProgress?.(`大纲已生成：${outline.chapters.length} 个章节`);

    // 第二步：生成详细内容
    onProgress?.("正在生成详细信息图卡片...");
    const deck = await generateInfographicDetails(outline, apiKey, settings, options);

    onProgress?.(`信息图生成完成！共 ${deck.slides.length} 张卡片`);
    return deck;
  } catch (error) {
    console.error('Infographic generation failed:', error);
    throw error;
  }
};

