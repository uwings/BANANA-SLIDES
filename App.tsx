
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, RefreshCw, ArrowLeft, Key, ExternalLink, Settings as SettingsIcon } from 'lucide-react';
import { SlideDeck, AppSettings, HistoryItem, ViewType, ResultTabType } from './types';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_SOCIAL_PROMPT, DEFAULT_STYLE_VARIABLES, DEFAULT_ASPECT_RATIO } from './constants';
import { generateSlideDeck, generateSlideImage } from './services/geminiService';
import { buildDeckPrompt, buildImagePrompt } from './utils/promptBuilder';

// Sub-components
import { HistorySidebar } from './components/HistorySidebar';
import { InputView } from './components/InputView';
import { ResultsFrame } from './components/ResultsFrame';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  // --- BYOK UI States ---
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // --- UI States ---
  const [view, setView] = useState<ViewType>('input');
  const [resultTab, setResultTab] = useState<ResultTabType>('content');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const isResizing = useRef(false);
  
  // --- Data States ---
  const [userInput, setUserInput] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [deck, setDeck] = useState<SlideDeck | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  // --- Settings ---
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('banana_slides_settings');
    if (saved) return JSON.parse(saved);
    return {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      socialPrompt: DEFAULT_SOCIAL_PROMPT,
      styleVariables: DEFAULT_STYLE_VARIABLES,
      aspectRatio: DEFAULT_ASPECT_RATIO as any
    };
  });

  // Check for API key on startup
  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasApiKey(true);
  };

  // Resizing logic
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

  // --- Queue logic for batch image generation ---
  const [queue, setQueue] = useState<number[]>([]);
  const isProcessingQueue = useRef(false);

  // Persistence
  useEffect(() => {
    const savedHistory = localStorage.getItem('banana_slides_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('banana_slides_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('banana_slides_settings', JSON.stringify(settings));
  }, [settings]);

  // --- Handlers ---
  const handleImportUrl = async () => {
    if (!importUrl) return;
    try {
      setIsGenerating(true);
      const jinaUrl = `https://r.jina.ai/${importUrl}`;
      const response = await fetch(jinaUrl);
      const text = await response.text();
      setUserInput(text);
      setImportUrl('');
    } catch (error) {
      alert('导入失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDeck = async () => {
    if (!userInput.trim()) return;
    setIsGenerating(true);
    try {
      const fullPrompt = buildDeckPrompt(userInput, settings);
      const result = await generateSlideDeck(fullPrompt);
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
        userInput,
        deck: result
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      setCurrentHistoryId(newHistoryItem.id);
      setDeck(result);
      setView('results');
      setResultTab('content');
    } catch (error: any) {
      console.error(error);
      if (error.message === "API_KEY_EXPIRED") {
        setHasApiKey(false);
      } else {
        alert('生成失败，请检查设置');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImageForSlide = async (slideIndex: number) => {
    if (!deck) return;
    
    setDeck(prev => {
      if (!prev) return null;
      const newSlides = [...prev.slides];
      newSlides[slideIndex] = { ...newSlides[slideIndex], isGeneratingImage: true };
      return { ...prev, slides: newSlides };
    });

    try {
      const slide = deck.slides[slideIndex];
      const imagePrompt = buildImagePrompt(deck.styleInstruction, slide.visual, slide.layout, settings.aspectRatio);
      const imageUrl = await generateSlideImage(imagePrompt, settings.aspectRatio);

      setDeck(prev => {
        if (!prev) return null;
        const newSlides = [...prev.slides];
        newSlides[slideIndex] = { ...newSlides[slideIndex], generatedImageUrl: imageUrl, isGeneratingImage: false };
        const updatedDeck = { ...prev, slides: newSlides };
        if (currentHistoryId) {
          setHistory(hPrev => hPrev.map(h => h.id === currentHistoryId ? { ...h, deck: updatedDeck } : h));
        }
        return updatedDeck;
      });
    } catch (error: any) {
      console.error(error);
      if (error.message === "API_KEY_EXPIRED") {
        setHasApiKey(false);
      }
      setDeck(prev => {
        if (!prev) return null;
        const newSlides = [...prev.slides];
        newSlides[slideIndex] = { ...newSlides[slideIndex], isGeneratingImage: false };
        return { ...prev, slides: newSlides };
      });
    }
  };

  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || queue.length === 0) return;
    isProcessingQueue.current = true;
    const slideIndex = queue[0];
    await generateImageForSlide(slideIndex);
    setQueue(prev => prev.slice(1));
    isProcessingQueue.current = false;
  }, [queue, deck, currentHistoryId, settings.aspectRatio]);

  useEffect(() => {
    if (queue.length > 0 && !isProcessingQueue.current) processQueue();
  }, [queue, processQueue]);

  // Mandatory BYOK Splash
  if (hasApiKey === false) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl space-y-8 border border-slate-700 animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-yellow-400 rounded-full">
              <Key className="w-10 h-10 text-slate-900" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">配置 Gemini API 密钥</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              为了使用 BananaSlides AI 生成高画质图像和深度叙事内容，您需要提供自己的 Google Gemini API 密钥。
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleOpenKeySelector}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 py-4 rounded-xl font-black text-lg shadow-xl shadow-yellow-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Key className="w-5 h-5" /> 选择 API 密钥
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors py-2"
            >
              查看计费文档 <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Notice</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              您的密钥保存在浏览器本地，我们不会在服务器上存储您的任何个人信息。请确保您的密钥来自已启用结算的 GCP 项目。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (hasApiKey === null) return null;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-yellow-200">
      <HistorySidebar 
        isOpen={isSidebarOpen}
        history={history}
        currentId={currentHistoryId}
        width={sidebarWidth}
        onLoad={(item) => {
          setDeck(item.deck);
          setUserInput(item.userInput);
          setCurrentHistoryId(item.id);
          setView('results');
          setResultTab('content');
        }}
        onDelete={(id) => {
          setHistory(prev => prev.filter(h => h.id !== id));
          if (currentHistoryId === id) {
            setCurrentHistoryId(null);
            setDeck(null);
            setView('input');
          }
        }}
        onImport={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const imported = JSON.parse(evt.target?.result as string) as HistoryItem[];
              setHistory(prev => {
                const combined = [...imported, ...prev];
                const unique = combined.reduce((acc, current) => {
                  const x = acc.find(item => item.id === current.id);
                  if (!x) return acc.concat([current]);
                  return acc;
                }, [] as HistoryItem[]);
                return unique.sort((a, b) => b.timestamp - a.timestamp);
              });
              alert('导入成功');
            } catch (e) { alert('导入失败，格式错误'); }
          };
          reader.readAsText(file);
        }}
        onExport={() => {
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
          const link = document.createElement('a');
          link.setAttribute("href", dataStr);
          link.setAttribute("download", `banana_slides_history_${Date.now()}.json`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }}
        onNew={() => {
          setView('input');
          setCurrentHistoryId(null);
          setDeck(null);
          setUserInput('');
        }}
        onResize={startResizing}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-3 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
            >
              <Layout className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">BANANA SLIDES</h1>
              <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.4em] mt-1">Narrative First</span>
            </div>
            {view === 'results' && (
              <button 
                onClick={() => setView('input')}
                className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-all bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg uppercase tracking-widest active:scale-95 ml-4"
              >
                <ArrowLeft className="w-4 h-4" /> Edit Narrative
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-3 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-90"
            >
              <SettingsIcon className="w-6 h-6 text-slate-500" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-7xl mx-auto w-full">
            {view === 'input' && (
              <InputView 
                userInput={userInput}
                importUrl={importUrl}
                isGenerating={isGenerating}
                onUserInputChange={setUserInput}
                onImportUrlChange={setImportUrl}
                onImport={handleImportUrl}
                onGenerate={handleGenerateDeck}
              />
            )}

            {view === 'results' && deck && (
              <ResultsFrame 
                deck={deck}
                activeTab={resultTab}
                onTabChange={setResultTab}
                onGenerateAllImages={() => setQueue(deck.slides.map((_, i) => i))}
                onGenerateSingleImage={generateImageForSlide}
                aspectRatio={settings.aspectRatio}
              />
            )}
          </div>
        </main>
      </div>

      {showSettings && (
        <SettingsModal 
          settings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {queue.length > 0 && (
        <div className="fixed bottom-10 right-10 z-50 bg-slate-900 text-white shadow-2xl rounded-2xl p-6 flex items-center gap-6 animate-in slide-in-from-right-10 duration-500 border border-slate-800">
          <div className="relative flex items-center justify-center">
             <RefreshCw className="w-8 h-8 animate-spin text-yellow-400" />
             <span className="absolute text-[10px] font-black">{queue.length}</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Rendering Scenes</p>
            <p className="text-sm font-bold text-slate-300">正在生成高画质 {settings.aspectRatio} 图像...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
