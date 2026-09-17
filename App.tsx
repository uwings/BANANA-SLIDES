
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { SlideDeck, HistoryItem, ViewType, ResultTabType, StyleTemplateKey } from './types';
import { STYLE_TEMPLATES } from './constants';
import { generateSlideDeck, generateInfographicDeck, generateSocialMediaFromSlides, generateSocialMediaFromInput } from './services/geminiService';
import { buildDeckPrompt } from './utils/promptBuilder';

// Sub-components
import { HistorySidebar } from './components/HistorySidebar';
import { InputView } from './components/InputView';
import { ResultsFrame } from './components/ResultsFrame';
import { SettingsModal } from './components/SettingsModal';
import { Modal, Toast } from './components/Modal';
import { AppHeader } from './components/AppHeader';
import { QueueIndicator } from './components/QueueIndicator';

// Hooks
import { useApiKey } from './hooks/useApiKey';
import { useHistory } from './hooks/useHistory';
import { useImageQueue } from './hooks/useImageQueue';

// BackToTop Component
const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-40 bg-white p-3 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      title="回到顶部"
    >
      <ArrowUp className="w-5 h-5 text-slate-600" />
    </button>
  );
};

const App: React.FC = () => {
  // --- Notification State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'success' | 'error' | 'info' | 'confirm';
    title: string;
    message?: string;
  }>({ type: 'info', title: '' });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showModal = (config: typeof modalConfig) => {
    setModalConfig(config);
    setModalOpen(true);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const handleCloseToast = () => setToast(null);

  // --- UI State ---
  const [view, setView] = useState<ViewType>('input');
  const [resultTab, setResultTab] = useState<ResultTabType>('content');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const isResizing = useRef(false);

  // --- Data State ---
  const [userInput, setUserInput] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressLog, setProgressLog] = useState<string>('');
  const [deck, setDeck] = useState<SlideDeck | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [generationMode, setGenerationMode] = useState<'slide' | 'infographic'>('slide');

  // --- Hooks ---
  const { settings, setSettings, isInitialized } = useApiKey();
  const { history, deleteItem, addItem, importHistory, updateItem } = useHistory();

  // --- API Key Guard ---
  // 不再强制首屏配置密钥：主界面直接可用，仅在执行需要密钥的操作时引导前往设置
  const ensureApiKey = (): boolean => {
    if (settings.apiKey.trim()) return true;
    showModal({
      type: 'info',
      title: '需要 API 密钥',
      message: '请先在设置中配置 Gemini API 密钥。'
    });
    setShowSettings(true);
    return false;
  };

  // --- Slide Update Handler ---
  const updateSlide = useCallback((index: number, updates: Partial<any>) => {
    setDeck(prev => {
      if (!prev) return null;
      const newSlides = [...prev.slides];
      newSlides[index] = { ...newSlides[index], ...updates };
      const updatedDeck = { ...prev, slides: newSlides };
      return updatedDeck;
    });

    // Sync with history
    if (currentHistoryId) {
      updateItem(currentHistoryId, {
        deck: {
          ...deck!,
          slides: deck!.slides.map((slide, i) =>
            i === index ? { ...slide, ...updates } : slide
          )
        }
      });
    }
  }, [deck, currentHistoryId, updateItem]);

  const { queueLength, addToQueue, generateImage } = useImageQueue(
    deck,
    settings.apiKey,
    settings.aspectRatio,
    setProgressLog,
    updateSlide
  );

  // --- Resizing Logic ---
  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = Math.max(200, Math.min(600, e.clientX));
    setSidebarWidth(newWidth);
  }, []);

  // --- Import URL Handler ---
  const handleImportUrl = async () => {
    if (!importUrl) return;
    try {
      setIsGenerating(true);
      const response = await fetch(`https://r.jina.ai/${importUrl}`);
      const text = await response.text();
      setUserInput(text);
      setImportUrl('');
    } catch {
      showToast('导入失败', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Generate Deck Handler ---
  const handleGenerateDeck = async () => {
    if (!userInput.trim()) return;
    if (!ensureApiKey()) return;

    setIsGenerating(true);
    setProgressLog('正在准备生成内容...');

    try {
      let result: SlideDeck;

      if (generationMode === 'slide') {
        // 现有幻灯片生成逻辑
        const fullPrompt = buildDeckPrompt(userInput, settings);
        result = await generateSlideDeck(
          fullPrompt,
          settings.apiKey,
          { onProgress: (msg) => setProgressLog(msg) }
        );
      } else {
        // 新增：信息图生成逻辑
        result = await generateInfographicDeck(
          userInput,
          settings.apiKey,
          settings,
          { onProgress: (msg) => setProgressLog(msg) }
        );
      }

      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
        userInput,
        deck: result
      };

      addItem(newHistoryItem);
      setCurrentHistoryId(newHistoryItem.id);
      setDeck(result);
      setView('results');
      setResultTab('content');
      setProgressLog('');

      // Auto-generate social media after slides are generated
      generateSocialMediaFromSlides(settings.socialPrompt, result, settings.apiKey)
        .then(newSocialMedia => {
          setDeck(prev => {
            if (!prev) return null;
            const updated = { ...prev, socialMedia: newSocialMedia };
            // Update history
            if (currentHistoryId) {
              updateItem(currentHistoryId, { deck: updated });
            }
            return updated;
          });
        })
        .catch(err => console.error('Auto-generate social media failed:', err));
    } catch (error: any) {
      console.error(error);
      setProgressLog('');
      if (error.message === "API_KEY_EXPIRED") {
        showModal({
          type: 'error',
          title: 'API 密钥已过期',
          message: '请重新配置有效的 Gemini API 密钥。'
        });
      } else {
        showModal({
          type: 'error',
          title: '生成失败',
          message: error.message || '请检查设置后重试。'
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Generate Single Image Handler ---
  const handleGenerateSingleImage = async (slideIndex: number, customStyle?: string, styleKey?: StyleTemplateKey) => {
    if (!ensureApiKey()) return;
    try {
      await generateImage(slideIndex, customStyle, styleKey);
    } catch (error: any) {
      if (error.message === "API_KEY_EXPIRED") {
        showModal({
          type: 'error',
          title: 'API 密钥已过期',
          message: '请重新配置有效的 Gemini API 密钥。'
        });
      }
    }
  };

  // --- Generate All Images Handler ---
  const handleGenerateAllImages = (styleKey?: string, customStyle?: string) => {
    if (!deck) return;
    if (!ensureApiKey()) return;
    // Resolve styleKey to the actual template from STYLE_TEMPLATES
    const resolvedStyleKey = styleKey as StyleTemplateKey | undefined;
    const resolvedCustomStyle = resolvedStyleKey ? STYLE_TEMPLATES[resolvedStyleKey] : (customStyle || undefined);

    const items = (deck.slides || []).map((slide, i) => ({
      index: i,
      customStyle: resolvedCustomStyle || slide.customStyleVariables,
      styleKey: resolvedStyleKey || slide.styleKey
    }));
    addToQueue(items);
  };

  // --- Load History Item ---
  const loadHistoryItem = useCallback((item: HistoryItem) => {
    setDeck(item.deck);
    setUserInput(item.userInput);
    setCurrentHistoryId(item.id);
    setView('results');
    setResultTab('content');
  }, []);

  // --- Handle New Project ---
  const handleNewProject = useCallback(() => {
    setView('input');
    setCurrentHistoryId(null);
    setDeck(null);
    setUserInput('');
  }, []);

  // --- Handle Export ---
  const handleExport = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `banana_slides_history_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('导出成功', 'success');
  }, [history]);

  // --- Handle Import ---
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string) as HistoryItem[];
        importHistory(imported);
        showToast('导入成功', 'success');
      } catch {
        showModal({
          type: 'error',
          title: '导入失败',
          message: '文件格式错误，请确保导入的是正确的 JSON 文件。'
        });
      }
    };
    reader.readAsText(file);
  }, [importHistory, showModal, showToast]);

  // --- Handle Delete History Item ---
  const handleDeleteItem = useCallback(async (id: string) => {
    deleteItem(id);
    if (currentHistoryId === id) {
      setCurrentHistoryId(null);
      setDeck(null);
      setView('input');
    }
  }, [deleteItem, currentHistoryId]);

  // --- Handle Regenerate Social Media from Slides ---
  const handleRegenerateSocialFromSlides = useCallback(async () => {
    if (!deck) return;
    if (!settings.apiKey.trim()) {
      showModal({
        type: 'info',
        title: '需要 API 密钥',
        message: '请先在设置中配置 Gemini API 密钥。'
      });
      setShowSettings(true);
      return;
    }

    try {
      const newSocialMedia = await generateSocialMediaFromSlides(
        settings.socialPrompt,
        deck,
        settings.apiKey
      );

      setDeck(prev => {
        if (!prev) return null;
        return { ...prev, socialMedia: newSocialMedia };
      });

      // Sync with history
      if (currentHistoryId) {
        updateItem(currentHistoryId, {
          deck: { ...deck, socialMedia: newSocialMedia }
        });
      }

      showToast('已根据幻灯片重新生成营销文案', 'success');
    } catch (error) {
      console.error(error);
      showToast('重新生成失败，请重试', 'error');
    }
  }, [deck, settings.socialPrompt, settings.apiKey, showToast, currentHistoryId, updateItem]);

  // --- Handle Regenerate Social Media from Original Input ---
  const handleRegenerateSocialFromInput = useCallback(async () => {
    if (!deck) return;
    if (!settings.apiKey.trim()) {
      showModal({
        type: 'info',
        title: '需要 API 密钥',
        message: '请先在设置中配置 Gemini API 密钥。'
      });
      setShowSettings(true);
      return;
    }

    // Get original userInput from history
    const historyItem = history.find(h => h.id === currentHistoryId);
    const originalUserInput = historyItem?.userInput || '';

    if (!originalUserInput) {
      showToast('无法获取原始输入内容', 'error');
      return;
    }

    try {
      const newSocialMedia = await generateSocialMediaFromInput(
        settings.socialPrompt,
        originalUserInput,
        deck,
        settings.apiKey
      );

      setDeck(prev => {
        if (!prev) return null;
        return { ...prev, socialMedia: newSocialMedia };
      });

      // Sync with history
      if (currentHistoryId) {
        updateItem(currentHistoryId, {
          deck: { ...deck, socialMedia: newSocialMedia }
        });
      }

      showToast('已根据原文重新生成营销文案', 'success');
    } catch (error) {
      console.error(error);
      showToast('重新生成失败，请重试', 'error');
    }
  }, [deck, settings.socialPrompt, settings.apiKey, showToast, currentHistoryId, updateItem, history]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-yellow-200">
      <HistorySidebar
        isOpen={isSidebarOpen}
        history={history}
        currentId={currentHistoryId}
        width={sidebarWidth}
        onLoad={loadHistoryItem}
        onDelete={handleDeleteItem}
        onImport={handleImport}
        onExport={handleExport}
        onNew={handleNewProject}
        onResize={startResizing}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          view={view}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setShowSettings(true)}
          onEditNarrative={() => setView('input')}
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-7xl mx-auto w-full h-[calc(100vh-9rem)]">
            {view === 'input' && (
              <InputView
                userInput={userInput}
                importUrl={importUrl}
                isGenerating={isGenerating}
                progressLog={progressLog}
                hasExistingDeck={!!deck}
                onUserInputChange={setUserInput}
                onImportUrlChange={setImportUrl}
                onImport={handleImportUrl}
                onGenerate={handleGenerateDeck}
                onViewResults={() => {
                  setView('results');
                  setResultTab('content');
                }}
                generationMode={generationMode}
                onModeChange={setGenerationMode}
                apiKeyMissing={isInitialized && !settings.apiKey.trim()}
                onOpenSettings={() => setShowSettings(true)}
              />
            )}

            {view === 'results' && deck && (
              <ResultsFrame
                deck={deck}
                activeTab={resultTab}
                onTabChange={setResultTab}
                onGenerateAllImages={handleGenerateAllImages}
                onGenerateSingleImage={handleGenerateSingleImage}
                onShowToast={showToast}
                aspectRatio={settings.aspectRatio}
                onRegenerateSocialFromSlides={handleRegenerateSocialFromSlides}
                onRegenerateSocialFromInput={handleRegenerateSocialFromInput}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      {/* isInitialized 门槛：避免在 IndexedDB 异步加载完成前用默认空设置快照出 localSettings，
          之后保存时覆盖已保存的密钥与自定义 Prompt */}
      {showSettings && isInitialized && (
        <SettingsModal
          settings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalConfig.type}
          title={modalConfig.title}
          message={modalConfig.message}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />
      )}

      <QueueIndicator queueLength={queueLength} aspectRatio={settings.aspectRatio} />
      <BackToTop />
    </div>
  );
};

export default App;
