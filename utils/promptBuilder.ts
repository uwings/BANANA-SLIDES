
import { AppSettings } from "../types";

/**
 * Constructs the final prompt for slide deck generation by injecting
 * user input and style variables into the system prompt template.
 *
 * New prompt structure supports:
 * - {userInput}: The user's input content
 * - {styling}: Core styling instructions
 * - {styling_variables}: Style variables (Design Aesthetic, Colors, Fonts, etc.)
 * - {aspectRatio}: Image aspect ratio
 */
export const buildDeckPrompt = (userInput: string, settings: AppSettings): string => {
  const styleVariables = settings.styleVariables || '';

  // Extract core styling from style variables
  const styling = `**核心指令 (CORE DIRECTIVES):**
1. 分析用户输入的内容主题、结构、意图和关键要素。
2. 将内容转化为带有即用型设计线索的结构化叙事。
3. 每张幻灯片的视觉描述必须足够详细，让 AI 能够直接生成高质量图像。
4. 封面页和封底页必须与内容页有明显的视觉风格差异。
5. 所有视觉输出必须严格保持 ${settings.aspectRatio} 的长宽比。

**风格指令 (STYLE INSTRUCTIONS):**
${styleVariables}`;

  return settings.systemPrompt
    .replace('{userInput}', userInput)
    .replace('{styling}', styling)
    .replace('{styling_variables}', styleVariables)
    .replace('{aspectRatio}', settings.aspectRatio);
};

/**
 * Constructs the visual prompt for a specific slide by combining
 * the overall style instructions with slide-specific visual and layout cues.
 */
export const buildImagePrompt = (
  styleInstruction: string,
  visual: string,
  layout: string,
  aspectRatio: string,
  title?: string
): string => {
  return `
## 视觉创作指令

**整体风格参考:**
${styleInstruction}

**当前页面要求:**
- 页面标题: ${title || '无标题'}
- 视觉内容描述: ${visual}
- 布局结构: ${layout}
- 画面比例: ${aspectRatio}

**生成要求:**
1. 严格遵循上述整体风格，确保视觉一致性
2. 构图布局必须符合布局结构描述
3. 画面比例必须是 ${aspectRatio}
4. 生成的图像必须清晰、专业、高质量
5. 包含的任何文字都必须是易读且专业的
6. 视觉效果应支持叙事目标的传达

请生成符合以上要求的高质量图像。
`;
};

/**
 * Constructs the social media prompt by injecting slide content
 */
export const buildSocialPrompt = (slidesContent: string, settings: AppSettings): string => {
  return settings.socialPrompt
    .replace('{slides_content}', slidesContent);
};
