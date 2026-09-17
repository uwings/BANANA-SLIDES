
import { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_SOCIAL_PROMPT, DEFAULT_STYLE_VARIABLES, DEFAULT_ASPECT_RATIO, DEFAULT_INFOGRAPHIC_OUTLINE_PROMPT, DEFAULT_INFOGRAPHIC_DETAIL_PROMPT } from '../constants';
import { initDB, getSettings, saveSettings } from '../utils/indexedDB';

export function useApiKey() {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    socialPrompt: DEFAULT_SOCIAL_PROMPT,
    styleVariables: DEFAULT_STYLE_VARIABLES,
    aspectRatio: DEFAULT_ASPECT_RATIO as any,
    infographicOutlinePrompt: DEFAULT_INFOGRAPHIC_OUTLINE_PROMPT,
    infographicDetailPrompt: DEFAULT_INFOGRAPHIC_DETAIL_PROMPT,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize and load settings
  useEffect(() => {
    const initialize = async () => {
      await initDB();
      const savedSettings = await getSettings();
      if (savedSettings) {
        // 向后兼容：如果旧设置没有新字段，使用默认值
        setSettings({
          apiKey: (savedSettings.apiKey || '').trim(),
          systemPrompt: savedSettings.systemPrompt || DEFAULT_SYSTEM_PROMPT,
          socialPrompt: savedSettings.socialPrompt || DEFAULT_SOCIAL_PROMPT,
          styleVariables: savedSettings.styleVariables || DEFAULT_STYLE_VARIABLES,
          aspectRatio: savedSettings.aspectRatio || DEFAULT_ASPECT_RATIO,
          // 新字段：如果不存在则使用默认值
          infographicOutlinePrompt: savedSettings.infographicOutlinePrompt || DEFAULT_INFOGRAPHIC_OUTLINE_PROMPT,
          infographicDetailPrompt: savedSettings.infographicDetailPrompt || DEFAULT_INFOGRAPHIC_DETAIL_PROMPT,
        });
      }
      setIsInitialized(true);
    };
    initialize();
  }, []);

  // Auto-save settings
  useEffect(() => {
    if (isInitialized) {
      saveSettings(settings).catch(console.error);
    }
  }, [settings, isInitialized]);

  return {
    settings,
    setSettings,
    isInitialized
  };
}
