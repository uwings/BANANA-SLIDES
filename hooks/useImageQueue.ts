
import { useState, useEffect, useCallback, useRef } from 'react';
import { StyleTemplateKey, SlideDeck } from '../types';
import { generateSlideImage } from '../services/geminiService';
import { buildImagePrompt } from '../utils/promptBuilder';

interface QueueItem {
  index: number;
  customStyle?: string;
  styleKey?: StyleTemplateKey;
}

export function useImageQueue(
  deck: SlideDeck | null,
  apiKey: string,
  aspectRatio: string,
  setProgressLog: (msg: string) => void,
  updateSlide: (index: number, updates: Partial<any>) => void
) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const isProcessingQueue = useRef(false);

  const generateImage = useCallback(async (slideIndex: number, customStyle?: string, styleKey?: StyleTemplateKey) => {
    if (!deck) return;

    updateSlide(slideIndex, { isGeneratingImage: true, customStyleVariables: customStyle });

    try {
      const slide = deck.slides[slideIndex];
      const effectiveStyleInstruction = customStyle
        ? `**核心指令 (CORE DIRECTIVES):**
1. 严格遵循以下风格指令生成图像。
2. 保持画面比例一致。

**风格指令 (STYLE INSTRUCTIONS):**
${customStyle}`
        : deck.styleInstruction;

      const imagePrompt = buildImagePrompt(
        effectiveStyleInstruction,
        slide.visual,
        slide.layout,
        aspectRatio,
        deck.title
      );

      const imageUrl = await generateSlideImage(imagePrompt, apiKey, aspectRatio as any, {
        onProgress: (msg) => setProgressLog(`P${slide.pageNumber}: ${msg}`)
      });

      updateSlide(slideIndex, {
        generatedImageUrl: imageUrl,
        isGeneratingImage: false,
        customStyleVariables: customStyle,
        styleKey
      });
      setProgressLog('');
    } catch (error: any) {
      console.error(error);
      setProgressLog('');
      if (error.message === "API_KEY_EXPIRED") {
        throw error;
      }
      updateSlide(slideIndex, { isGeneratingImage: false });
    }
  }, [deck, apiKey, aspectRatio, setProgressLog, updateSlide]);

  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || queue.length === 0) return;
    isProcessingQueue.current = true;

    const { index, customStyle, styleKey } = queue[0];
    try {
      await generateImage(index, customStyle, styleKey);
    } catch (error) {
      console.error('Queue processing error:', error);
    }

    setQueue(prev => prev.slice(1));
    isProcessingQueue.current = false;
  }, [queue, generateImage]);

  // Start processing queue when items are added
  useEffect(() => {
    if (queue.length > 0 && !isProcessingQueue.current) {
      processQueue();
    }
  }, [queue, processQueue]);

  const addToQueue = useCallback((items: QueueItem[]) => {
    setQueue(prev => [...prev, ...items]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queueLength: queue.length,
    addToQueue,
    clearQueue,
    generateImage
  };
}
