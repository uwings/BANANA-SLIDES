
export const DEFAULT_SYSTEM_PROMPT = `---
name: Slide Deck Pro (幻灯片演示文稿)
description: 生成针对高阶 AI 图像生成优化的专业幻灯片大纲。强调叙事逻辑、高信息密度与视觉美学。
author: BananaSlides AI & Prompt Architect
version: 2.2
---

你是一位世界级的演示文稿设计师与视觉叙事专家。

## 核心指令 (CORE DIRECTIVES)

1. **深度内容重构**：分析输入素材的内在逻辑，拒绝简单的线性拆分。根据内容的主次和相似性重新组织页面。
2. **高密度视觉策略**：利用当前模型强大的理解力，在单个页面展示丰富且有层次的内容。使用网格化、对比式或并列式的布局承载复杂信息。
3. **架构师视角**：将视觉转化为具体的指令（颜色十六进制码、字体层级、构图比例），确保视觉描述足以让 AI 生成摄影级或高端平面设计级的图像。
4. **长宽比约束**：所有视觉输出必须严格保持 {aspectRatio} 的长宽比。
5. **语言与本地化**：内容使用中文，占位符保留中文。

## 风格指令 (STYLE INSTRUCTIONS)

{styling}

## 幻灯片逻辑与结构规则

1. **叙事性标题**：每一页的标题必须是一个有力、自信的"叙事主题句"，通过这些句子能串联成一个完整的故事。
2. **封面与封底**：
   - **封面**：海报级布局，设定全局基调。
   - **封底**：强有力的视觉总结、行动号召或引人深思的引用。
3. **内容页面组织**：
   - 若多个要点属于同一逻辑维度，应合并在同一张幻灯片中。
   - **每张幻灯片必须包含 4 部分**：
     - **NARRATIVE GOAL**: 该页在整体叙事弧光中的"战略意图"。
     - **KEY CONTENT**: 包含叙事性主题句及高密度的支撑要点（数据、案例、逻辑）。
     - **VISUAL**: 描述极其详尽的视觉画面。包含：主体、材质、光影、构图、色彩指令。
     - **LAYOUT**: 描述构图层级（如：左三右七、网格分布、对角线构图）。

## 重要约束

- **严禁"AI 废话"**：禁止出现"不仅仅是...更是..."、"在...的背景下"等陈词滥调。
- **数量控制**：5-15 页，**严禁超过 20 页**。
- **真实性**：所有具体数据必须溯源，不准凭空捏造。
- **禁止重复输出**：JSON 外严禁任何解释性文字。

## 输出格式

返回严格的 JSON 对象：

\`\`\`json
{
  "title": "幻灯片主标题（叙事性，25字以内）",
  "styleInstruction": "包含 Design Aesthetic, Color Palette, Typography 的 Markdown 指令块",
  "summary": "整体叙事逻辑简介（不超过400字）",
  "slides": [
    {
      "pageNumber": 1,
      "narrativeGoal": "叙事目标描述",
      "keyContent": "关键内容（标题+要点，含数据和案例）",
      "visual": "详细的视觉画面描述（AI可直接生成图像）",
      "layout": "布局结构描述"
    }
  ]
}
\`\`\`

## 输入素材

用户输入内容：
{userInput}

## 风格参考

{styling_variables}`;

export const DEFAULT_SOCIAL_PROMPT = `你是一位专业的小红书内容创作者。基于以下幻灯片内容，生成适合在小红书（Xiaohongshu）发布的推广内容。

## 要求

### 标题 (title)
- 不超过20字
- 吸睛且包含表情符号
- 体现内容的核心价值

### 简介 (intro)
- 600-800字
- 带有个人语气（非机械感）
- 多用 emoji 增强可读性
- 内容干货化、条理清晰
- 结构：开篇吸引 + 核心亮点3-4点 + 实用建议或行动号召
- 使用 emoji 替代可能触发审核的敏感词

### 标签 (tags)
- exactly 5 个标签
- 选择高热度、高相关的标签

## 幻灯片内容

title: {title}
summary: {summary}

slides overview:
{slides_overview}

## 输出格式

返回 JSON 对象：
\`\`\`json
{
  "title": "小红书标题",
  "intro": "小红书简介文案（600-800字）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"]
}
\`\`\``;

// 默认风格变量配置 - 保留原有格式但增加更详细的视觉指令
export const DEFAULT_STYLE_VARIABLES = `Design Aesthetic: 极简专业编辑风格。干净、精致、极简主义的编辑风格。整体感觉是精准、清晰和充满智慧的优雅。
Background Color: 微妙的灰白色 #F5F5F7，像高质量绘图纸。
Primary Font: 无衬线字体（如 Inter、Helvetica Neue）。用于所有标题，加粗渲染以增强冲击力。
Secondary Font: 同系列字体，保持较轻字重用于正文，确保高可读性。
Color Palette:
    Primary Text Color: 深板岩灰 #2F3542
    Primary Accent Color: 智能蓝 #007AFF
Visual Elements: 一致使用精细、准确的线条、示意图和干净的矢量图形。视觉效果是概念性和抽象的，旨在阐述想法而非描绘写实场景。布局空间感强且结构化，优先考虑信息层级和可读性。不包含页码、页脚、Logo 或页眉。`;

export const DEFAULT_ASPECT_RATIO = "3:4";

// 内置风格模板
export const STYLE_TEMPLATES = {
  default: DEFAULT_STYLE_VARIABLES,

  minimal: `Design Aesthetic: 极简主义风格。大量留白，元素精简，追求"少即是多"的设计哲学。
Background Color: 纯白 #FFFFFF
Primary Font: 无衬线字体
Secondary Font: 同系列字体
Color Palette:
    Primary Text Color: 纯黑 #000000
    Primary Accent Color: 灰色 #888888
Visual Elements: 极简线条、几何形状、大量留白。拒绝任何冗余装饰。`,

  tech: `Design Aesthetic: 科技感风格。赛博朋克与未来主义结合，强调数字化和科技感。
Background Color: 深蓝黑 #0A0A1A
Primary Font: 等宽字体或科技感无衬线字体
Secondary Font: 同系列字体
Color Palette:
    Primary Text Color: 亮青蓝 #00F0FF
    Primary Accent Color: 霓虹粉 #FF00AA
Visual Elements: 发光线条、网格背景、数据可视化元素、渐变效果。`,

  warm: `Design Aesthetic: 温暖手绘风格。亲切、富有启发性，带有明显的手绘触感。
Background Color: 柔和米白色 #F9F7F2，带有轻微的纸张纹理
Primary Font: 圆润字体（如圆体、手札体）
Secondary Font: 同样的圆润字体
Color Palette:
    Primary Text Color: 深炭灰 #333333
    Primary Accent Color: 活力珊瑚橘 #FF6B6B 和 亮粉蓝 #4ECDC4
Visual Elements: 手绘波浪线、不规则圆形圈注、涂鸦箭头、带有阴影和纹理的2D矢量插画。`,

  business: `Design Aesthetic: 商务专业风格。稳重大气，适合正式场合和商业展示。
Background Color: 浅灰 #F0F2F5
Primary Font: 经典无衬线字体（如 Arial、Roboto）
Secondary Font: 同系列字体
Color Palette:
    Primary Text Color: 深灰 #1A1A1A
    Primary Accent Color: 商务蓝 #0052CC
Visual Elements: 简洁的数据图表、时间轴、信息图表。避免过度装饰。`,

  creative: `Design Aesthetic: 创意波普风格。大胆、鲜艳、富有活力，适合创意展示。
Background Color: 明黄 #FFD700 或 亮粉 #FF6B6B
Primary Font: 粗壮的无衬线字体
Secondary Font: 同系列字体
Color Palette:
    Primary Text Color: 纯白 #FFFFFF
    Primary Accent Color: 荧光绿 #39FF14
Visual Elements: 大胆的色块碰撞、动态构图、夸张的排版、街头艺术风格。`,

  kawaii: `Design Aesthetic: Minimalist kawaii doodle illustration, whimsical hand-drawn digital art style. Clean organic textured outlines, soft pastel watercolor gradients, high-key lighting, airy and healing atmosphere. Floating decorative accents including tiny stars, sparkles, and simple hearts. Centered composition with generous negative space.
Background Color: Soft cream white #FDF8F3 with subtle grainy paper texture
Primary Font: Rounded cute font like Nunito or Quicksand, bold for headings
Secondary Font: Same rounded font family, lighter weight for body text
Color Palette:
    Primary Text Color: Warm charcoal gray #4A4A4A (avoid pure black)
    Primary Accent Color: Soft coral pink #FFB7B2, mint green #B5EAD7, lavender #E0BBE4
Visual Elements: Hand-drawn doodle style, organic brush strokes, pastel watercolor effects, cute kawaii characters with rounded features, floating decorative elements (stars, hearts, sparkles), gentle shadows, paper texture overlay. No harsh edges or realistic photos.`,

  mono: `Design Aesthetic: Mono-tone minimalist aesthetic. Single color dominance with subtle variations. Clean, modern, and sophisticated. Focus on typography and spacing.
Background Color: Light beige #FAFAF9 or soft gray #F5F5F4
Primary Font: Clean sans-serif (Inter, Helvetica Neue, or system fonts)
Secondary Font: Same font family, lighter weight
Color Palette:
    Primary Text Color: Dark gray #1C1917
    Primary Accent Color: Single accent color #57534E (warm gray) or #0EA5E9 (muted blue)
Visual Elements: Minimal geometric shapes, single color blocks, subtle shadows. Lots of negative space. Clean typography hierarchy. No gradients, no multiple accent colors.`,

  film: `Design Aesthetic: Film photography aesthetic. Nostalgic, warm, with authentic film grain texture. Evokes memories and emotional connection.
Background Color: Warm off-white #FFF9F5 or faded beige #F5F0EB
Primary Font: Elegant serif (Times New Roman, Georgia) or soft sans-serif
Secondary Font: Same font family
Color Palette:
    Primary Text Color: Warm brown #5D4E46 or soft black #2C2826
    Primary Accent Color: Sepia tones #C4A484, faded orange #E8DCC8
Visual Elements: Film grain texture overlay, light leaks, vintage photo borders, dust particles, soft focus areas. Warm color grading with subtle vignette. Nostalgic and authentic feel.`,

  dodocotton: `Design Aesthetic: Dodocotton style. Soft, cute, and cozy. Like a warm embrace. Extremely friendly and approachable visual language.
Background Color: Warm cream #FFFBF7 or soft peach #FFF5F0
Primary Font: Rounded, friendly fonts (Nunito, Quicksand, or rounded sans-serif)
Secondary Font: Same rounded font family
Color Palette:
    Primary Text Color: Soft brown #6B5B4F or warm gray #7A7270
    Primary Accent Color: Peach #FFDAB9, soft orange #FFB347, mint #B5EAD7
Visual Elements: Rounded corners everywhere, soft cloud shapes, cute blob motifs, hand-drawn style icons, simple line drawings with rounded ends. Warm and inviting atmosphere. No sharp edges.`,

  watercolor: `Design Aesthetic: Hand-painted watercolor illustration style. Artistic, fluid, and organic. Soft edges with subtle color bleeding.
Background Color: Natural white #FFFFFF or soft cream #FAF8F5 with paper texture
Primary Font: Elegant serif (Cormorant Garamond, Baskerville) or soft brush font
Secondary Font: Same elegant font family
Color Palette:
    Primary Text Color: Deep ink blue #2E4A62 or soft black #3A3A3A
    Primary Accent Color: Watercolor wash effects in soft blue #A8C6D8, rose #E8B4B8, sage green #B8D4BE
Visual Elements: Watercolor brushstrokes, irregular edges, paint bleeding effects, soft gradients, visible paper grain. Artistic and painterly. No hard outlines.`,

  glass: `Design Aesthetic: Glassmorphism / frosted glass aesthetic. Modern, translucent, and dimensional. Popular in contemporary UI design.
Background Color: Soft gradient backgrounds (lavender to pink or blue to teal)
Primary Font: Clean modern sans-serif (SF Pro, Inter, Roboto)
Secondary Font: Same font family
Color Palette:
    Primary Text Color: White #FFFFFF or very light gray #F8FAFC
    Primary Accent Color: White translucent overlays, subtle rainbow gradients
Visual Elements: Frosted glass effect with background blur, white semi-transparent borders, subtle inner glow, floating elements with shadows. Modern and sophisticated. Multi-layered depth.`,

  allie_brosh: `Design Aesthetic: Hyper-expressive "crude" digital art. Intentional low-fidelity MS-Paint aesthetic with raw, jagged lines. High emotional energy, chaotic yet focused on character expressions. Wide-eyed, triangle-shaped characters with iconic exaggerated poses.
Background Color: Bright, flat primary colors or stark white #FFFFFF
Primary Font: Comic-style hand-drawn font like "Patrick Hand" or "Indie Flower"
Secondary Font: Simple clean sans-serif for high readability
Color Palette:
    Primary Text Color: Solid Black #000000
    Primary Accent Color: Neon Pink #FF00FF, Bright Yellow #FFFF00, or Lime Green #00FF00
Visual Elements: Simple geometric shapes for bodies, "wiggly" outlines, vibrant and unblended colors, high-contrast emotional depictions, minimalist backgrounds to emphasize the character's internal monologue.`,

  sarah_andersen: `Design Aesthetic: Hand-drawn ink comic style (Sarah's Scribbles). Whimsical, relatable, and slightly messy. High contrast black-and-white ink work with occasional soft gray washes or single-color highlights. Thick, deliberate brush strokes.
Background Color: Clean White #FFFFFF or very light sketchbook paper texture
Primary Font: Handwritten comic font like "Coming Soon" or "Sniglet"
Secondary Font: Compact sans-serif for technical details
Color Palette:
    Primary Text Color: Deep Ink Black #1A1A1A
    Primary Accent Color: Soft Sky Blue #AED9E0 or Muted Rose #F2C6DE
Visual Elements: Iconic "messy bun" character, ink hatching for shadows, expressive "dot" eyes, organic and slightly shaky borders, focus on relatability and awkward charm.`,

  mattias_adolfsson: `Design Aesthetic: Detailed whimsical ink and watercolor illustration. "Horror vacui" (fear of empty space) style filled with intricate mechanical parts, weird characters, and baroque-modern machinery. Fine fountain pen lines with soft, vintage watercolor washes.
Background Color: Aged parchment or warm cream #F2E8D5
Primary Font: Classic serif with character like "EB Garamond" or "Playfair Display"
Secondary Font: Elegant, thin monospaced font for annotations
Color Palette:
    Primary Text Color: Sepia Brown #3D2B1F
    Primary Accent Color: Terracotta #C05746 or Muted Sage Green #8B9474
Visual Elements: Dense crowds of objects, clockwork details, steampunk elements, fine-line cross-hatching, watercolor bleeds, playful perspective distortions, imaginative hybrid creatures.`,

  george_barbier: `Design Aesthetic: Art Deco "Pochoir" illustration style. Rhythmic, stylized, and opulent. Features clean, sweeping silhouettes, bold patterns, and a sense of refined French luxury. Flat color planes with sophisticated, high-fashion compositions.
Background Color: Pale gold or elegant champagne #F7E7CE
Primary Font: Art Deco display font like "Broadway" or "Market Deco"
Secondary Font: High-contrast serif like "Bodoni 72"
Color Palette:
    Primary Text Color: Midnight Blue #191970 or Deep Emerald #043927
    Primary Accent Color: Metallic Gold #D4AF37 or Velvet Red #8A0707
Visual Elements: Ornate geometric patterns, stylized flora and fauna, exotic costumes, rhythmic line work, symmetrical layouts, high-fashion editorial feel from the 1920s.`,

  ivan_bilibin: `Design Aesthetic: Slavic Folklore "Golden Age" illustration. Strong, precise black outlines with flat, matte color fills. Highly decorative borders (frames) within the slide. Art Nouveau influence with a medieval, mystical atmosphere.
Background Color: Antique paper texture #E6D5B8
Primary Font: Ornate, strong serif like "Almendra" or "Luminari"
Secondary Font: Classic bookish serif like "Crimson Text"
Color Palette:
    Primary Text Color: Iron Black #2B2B2B
    Primary Accent Color: Deep Russet Red #912F1B or Forest Green #223026
Visual Elements: Intricate decorative frames/borders, flat perspective, nature-inspired patterns (pine cones, birds, berries), woodcut-like precision, epic and theatrical compositions.`
};
