
import React, { useState, useCallback } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { SlideDeck } from '../types';

interface SocialMarketingProps {
  social: SlideDeck['socialMedia'];
  onRegenerateFromSlides?: () => void;
  onRegenerateFromInput?: () => void;
}

// Error boundary wrapper component
class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ErrorFallback = () => (
  <div className="max-w-4xl mx-auto p-8 bg-red-50 rounded-2xl border border-red-200 text-center">
    <p className="text-red-600 font-medium">数据加载异常，请返回重新生成</p>
  </div>
);

export const SocialMarketing: React.FC<SocialMarketingProps> = ({ social, onRegenerateFromSlides, onRegenerateFromInput }) => {
  const [copied, setCopied] = useState<'title' | 'all' | null>(null);
  const [isRegeneratingSlides, setIsRegeneratingSlides] = useState(false);
  const [isRegeneratingInput, setIsRegeneratingInput] = useState(false);

  const safeSocial = social || { title: '', intro: '', tags: [] };
  const tagsArray = Array.isArray(safeSocial.tags) ? safeSocial.tags : [];

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied('all');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const copyTitle = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(safeSocial.title || '');
      setCopied('title');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [safeSocial.title]);

  const copyAll = useCallback(() => {
    const text = `${safeSocial.title ? `${safeSocial.title}\n\n` : ''}${safeSocial.intro || ''}\n\n${tagsArray.map(t => `#${t}`).join(' ')}`;
    copyToClipboard(text);
  }, [safeSocial.title, safeSocial.intro, tagsArray, copyToClipboard]);

  const handleRegenerateFromSlides = useCallback(async () => {
    if (!onRegenerateFromSlides) return;
    setIsRegeneratingSlides(true);
    try {
      await onRegenerateFromSlides();
    } finally {
      setIsRegeneratingSlides(false);
    }
  }, [onRegenerateFromSlides]);

  const handleRegenerateFromInput = useCallback(async () => {
    if (!onRegenerateFromInput) return;
    setIsRegeneratingInput(true);
    try {
      await onRegenerateFromInput();
    } finally {
      setIsRegeneratingInput(false);
    }
  }, [onRegenerateFromInput]);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-10 space-y-10">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-between border-l-4 border-yellow-400 pl-4">
                小红书标题 (吸睛版)
                <button
                  onClick={copyTitle}
                  className="flex items-center gap-1.5 hover:text-slate-900 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border text-[10px]"
                >
                  <Copy className="w-3 h-3" /> {copied === 'title' ? '已复制' : '复制标题'}
                </button>
              </label>
              <div className="text-2xl font-black p-6 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-100 transition-all text-slate-900 leading-tight">
                {safeSocial.title || '暂无标题'}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-between border-l-4 border-yellow-400 pl-4">
                正文文案
                <button
                  onClick={copyAll}
                  className="flex items-center gap-1.5 hover:text-slate-900 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border text-[10px]"
                >
                  <Copy className="w-3 h-3" /> {copied === 'all' ? '已复制' : '复制全部'}
                </button>
              </label>
              <div className="text-base text-slate-600 leading-[2] p-8 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-100 transition-all whitespace-pre-wrap font-medium">
                {safeSocial.intro || '暂无文案'}
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {tagsArray.length > 0 ? (
                    tagsArray.map((t: string, i: number) => (
                      <span key={i} className="text-blue-500 font-black hover:scale-105 transition-transform cursor-default">#{t}</span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">暂无标签</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 p-8 flex justify-center items-center gap-4">
            <div className="h-px bg-slate-800 flex-1"></div>
            <div className="flex items-center gap-3">
              <button
                onClick={copyAll}
                disabled={isRegeneratingSlides || isRegeneratingInput}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
              >
                <Copy className="w-4 h-4" /> 复制全部
              </button>
              <button
                onClick={handleRegenerateFromSlides}
                disabled={isRegeneratingSlides || !onRegenerateFromSlides}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRegeneratingSlides ? 'animate-spin' : ''}`} />
                {isRegeneratingSlides ? '生成中...' : '基于大纲重新生成'}
              </button>
              <button
                onClick={handleRegenerateFromInput}
                disabled={isRegeneratingInput || !onRegenerateFromInput}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRegeneratingInput ? 'animate-spin' : ''}`} />
                {isRegeneratingInput ? '生成中...' : '基于原文重新生成'}
              </button>
            </div>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
