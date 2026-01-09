
import React, { useState } from 'react';
import { ImageIcon, Download, Sparkles, ChevronDown, FileText } from 'lucide-react';
import { SlideDeck, ResultTabType, StyleTemplateKey } from '../types';
import { SlidesList } from './SlidesList';
import { SocialMarketing } from './SocialMarketing';

interface ResultsFrameProps {
  deck: SlideDeck;
  activeTab: ResultTabType;
  onTabChange: (tab: ResultTabType) => void;
  onGenerateAllImages: (styleKey?: string, customStyle?: string) => void;
  onGenerateSingleImage: (idx: number, customStyle?: string, styleKey?: StyleTemplateKey) => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  aspectRatio: string;
  onRegenerateSocialFromSlides?: () => Promise<void>;
  onRegenerateSocialFromInput?: () => Promise<void>;
}

const STYLE_OPTIONS = [
  { value: '', label: '使用默认风格', emoji: '✨' },
  { value: 'minimal', label: '极简风格', emoji: '◻️' },
  { value: 'tech', label: '科技风格', emoji: '🔮' },
  { value: 'warm', label: '温暖风格', emoji: '💛' },
  { value: 'business', label: '商务风格', emoji: '💼' },
  { value: 'creative', label: '创意风格', emoji: '🎨' },
  { value: 'kawaii', label: '可爱风格', emoji: '🌸' },
  { value: 'mono', label: '黑白风格', emoji: '◐' },
  { value: 'film', label: '胶片风格', emoji: '📷' },
  { value: 'dodocotton', label: '棉麻风格', emoji: '☁️' },
  { value: 'watercolor', label: '水彩风格', emoji: '🎨' },
  { value: 'glass', label: '玻璃风格', emoji: '🫧' },
  { value: 'allie_brosh', label: 'Allie漫画', emoji: '😜' },
  { value: 'sarah_andersen', label: 'Sarah涂鸦', emoji: '💬' },
  { value: 'mattias_adolfsson', label: '繁复幻想', emoji: '🔮' },
  { value: 'george_barbier', label: '装饰艺术', emoji: '✨' },
  { value: 'ivan_bilibin', label: '古典绘本', emoji: '📖' },
];

export const ResultsFrame: React.FC<ResultsFrameProps> = ({
  deck, activeTab, onTabChange, onGenerateAllImages, onGenerateSingleImage, onShowToast, aspectRatio, onRegenerateSocialFromSlides, onRegenerateSocialFromInput
}) => {
  const [selectedStyle, setSelectedStyle] = useState('');
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const slides = deck.slides || [];

  const currentStyle = STYLE_OPTIONS.find(s => s.value === selectedStyle) || STYLE_OPTIONS[0];

  const handleGenerateAll = () => {
    onGenerateAllImages(selectedStyle || undefined);
  };

  const handleDownloadAll = () => {
    const generatedSlides = slides.filter(s => !!s.generatedImageUrl);

    if (generatedSlides.length === 0) {
      onShowToast?.('请先生成图片后再下载', 'info');
      return;
    }

    generatedSlides.forEach((slide, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = slide.generatedImageUrl!;
        link.download = `slide-${slide.pageNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 200);
    });
    onShowToast?.(`正在下载 ${generatedSlides.length} 张图片`, 'success');
  };

  const handleExportMarkdown = () => {
    try {
      let markdown = `# ${deck.title || '无标题'}\n\n`;
      markdown += `> ${deck.summary || ''}\n\n`;
      markdown += `---\n\n`;
      markdown += `## 幻灯片大纲 (${slides.length}页)\n\n`;

      slides.forEach((slide) => {
        markdown += `### 第 ${slide.pageNumber} 页 - ${slide.narrativeGoal || '无叙事目标'}\n\n`;
        markdown += `**布局**: ${slide.layout || '无布局描述'}\n\n`;
        markdown += `**内容**:\n${slide.keyContent || '无内容'}\n\n`;
        markdown += `**视觉提示词**:\n${slide.visual || '无视觉描述'}\n\n`;
        markdown += `---\n\n`;
      });

      if (deck.socialMedia) {
        markdown += `## 小红书营销文案\n\n`;
        markdown += `### 标题\n${deck.socialMedia.title || '无标题'}\n\n`;
        markdown += `### 简介\n${deck.socialMedia.intro || '无简介'}\n\n`;
        markdown += `### 标签\n${(deck.socialMedia.tags || []).map(t => `#${t}`).join(' ')}\n\n`;
      }

      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${(deck.title || '无标题').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_原稿.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      onShowToast?.('导出成功', 'success');
    } catch (error) {
      console.error('Export error:', error);
      onShowToast?.('导出失败，请重试', 'error');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
             <span className="bg-yellow-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Generation Complete</span>
             <span className="text-gray-400 text-[10px] font-black uppercase tracking-wider">{slides.length} SLIDES</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">{deck.title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-4xl font-medium">{deck.summary}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(deck.socialMedia?.tags || []).map((t, i) => (
              <span key={i} className="text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded uppercase tracking-widest">#{t}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0">
          {/* 风格选择下拉菜单 */}
          <div className="relative">
            <button
              onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
              className="flex items-center justify-between gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg font-black text-xs hover:bg-slate-200 transition-all w-full lg:w-auto border border-slate-200"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>{currentStyle.emoji} {currentStyle.label}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isStyleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStyleDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto min-w-[180px]">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => {
                      setSelectedStyle(style.value);
                      setIsStyleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors ${selectedStyle === style.value ? 'bg-yellow-50 text-yellow-700' : ''}`}
                  >
                    <span>{style.emoji}</span>
                    <span>{style.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateAll}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-lg font-black text-xs shadow-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            <ImageIcon className="w-4 h-4" /> 一键生成图片
          </button>
          <button
            onClick={handleDownloadAll}
            className="flex items-center justify-center gap-2 border border-slate-200 bg-white px-5 py-3 rounded-lg font-black text-xs hover:bg-gray-50 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-600" /> 下载已生成
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center justify-center gap-2 border border-slate-200 bg-white px-5 py-3 rounded-lg font-black text-xs hover:bg-gray-50 transition-all active:scale-95"
          >
            <FileText className="w-4 h-4 text-slate-600" /> 导出原稿
          </button>
        </div>
      </div>

      <div className="flex bg-white/50 p-1 rounded-lg border border-gray-100 self-start w-fit shadow-sm">
        <button 
          onClick={() => onTabChange('content')}
          className={`px-5 py-2 font-black text-[10px] tracking-widest transition-all rounded-md ${activeTab === 'content' ? 'bg-white shadow-sm text-slate-900 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
        >
          幻灯片大纲
        </button>
        <button 
          onClick={() => onTabChange('social')}
          className={`px-5 py-2 font-black text-[10px] tracking-widest transition-all rounded-md ${activeTab === 'social' ? 'bg-white shadow-sm text-slate-900 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
        >
          营销文案
        </button>
      </div>

      {activeTab === 'content' ? (
        <SlidesList slides={slides} onGenerateSingleImage={onGenerateSingleImage} aspectRatio={aspectRatio} />
      ) : (
        <SocialMarketing
          social={deck.socialMedia || { title: '', intro: '', tags: [] }}
          onRegenerateFromSlides={onRegenerateSocialFromSlides}
          onRegenerateFromInput={onRegenerateSocialFromInput}
        />
      )}
    </div>
  );
};
