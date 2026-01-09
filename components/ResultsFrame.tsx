
import React from 'react';
import { ImageIcon, Share2, Download } from 'lucide-react';
import { SlideDeck, ResultTabType } from '../types';
import { SlidesList } from './SlidesList';
import { SocialMarketing } from './SocialMarketing';

interface ResultsFrameProps {
  deck: SlideDeck;
  activeTab: ResultTabType;
  onTabChange: (tab: ResultTabType) => void;
  onGenerateAllImages: () => void;
  onGenerateSingleImage: (idx: number) => void;
  aspectRatio: string;
}

export const ResultsFrame: React.FC<ResultsFrameProps> = ({
  deck, activeTab, onTabChange, onGenerateAllImages, onGenerateSingleImage, aspectRatio
}) => {
  const handleDownloadAll = () => {
    const generatedSlides = deck.slides.filter(s => !!s.generatedImageUrl);
    
    if (generatedSlides.length === 0) {
      alert('请先生成图片，然后再进行下载。您可以点击“一键生成全套图片”或在单页卡片中点击生成。');
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
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
             <span className="bg-yellow-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Generation Complete</span>
             <span className="text-gray-400 text-[10px] font-black uppercase tracking-wider">{deck.slides.length} SLIDES</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">{deck.title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-4xl font-medium">{deck.summary}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {deck.socialMedia.tags.map((t, i) => (
              <span key={i} className="text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded uppercase tracking-widest">#{t}</span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0">
          <button 
            onClick={onGenerateAllImages}
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
            className="flex items-center justify-center gap-2 border border-slate-200 bg-white px-5 py-3 rounded-lg font-black text-xs hover:bg-gray-50 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4 text-slate-600" /> 导出演示稿
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
        <SlidesList slides={deck.slides} onGenerateSingleImage={onGenerateSingleImage} aspectRatio={aspectRatio} />
      ) : (
        <SocialMarketing social={deck.socialMedia} />
      )}
    </div>
  );
};
