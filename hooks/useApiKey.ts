
import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_SOCIAL_PROMPT, DEFAULT_STYLE_VARIABLES, DEFAULT_ASPECT_RATIO } from '../constants';
import { initDB, getSettings, saveSettings } from '../utils/indexedDB';
import { testApiKey } from '../services/geminiService';

export function useApiKey() {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    socialPrompt: DEFAULT_SOCIAL_PROMPT,
    styleVariables: DEFAULT_STYLE_VARIABLES,
    aspectRatio: DEFAULT_ASPECT_RATIO as any
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<'valid' | 'invalid' | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Initialize and load settings
  useEffect(() => {
    const initialize = async () => {
      await initDB();
      const savedSettings = await getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
      setIsInitialized(true);
    };
    initialize();
  }, []);

  // Check API key after initialization
  useEffect(() => {
    if (isInitialized) {
      setHasApiKey(!!settings.apiKey);
    }
  }, [settings.apiKey, isInitialized]);

  // Auto-save settings
  useEffect(() => {
    if (isInitialized) {
      saveSettings(settings).catch(console.error);
    }
  }, [settings, isInitialized]);

  const testApiKeyHandler = useCallback(async () => {
    if (!apiKeyInput.trim()) return;
    setIsTestingKey(true);
    setKeyTestResult(null);
    try {
      const isValid = await testApiKey(apiKeyInput);
      setKeyTestResult(isValid ? 'valid' : 'invalid');
      if (isValid) {
        setSettings(prev => ({ ...prev, apiKey: apiKeyInput }));
      }
    } catch {
      setKeyTestResult('invalid');
    } finally {
      setIsTestingKey(false);
    }
  }, [apiKeyInput]);

  const startUsing = useCallback(() => {
    setHasApiKey(true);
  }, []);

  return {
    settings,
    setSettings,
    isInitialized,
    hasApiKey,
    apiKeyInput,
    setApiKeyInput,
    isTestingKey,
    keyTestResult,
    testApiKey: testApiKeyHandler,
    startUsing
  };
}
