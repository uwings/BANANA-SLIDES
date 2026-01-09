
import React from 'react';
import { ImageIcon, Download, RefreshCw } from 'lucide-react';
import { Slide } from '../types';

interface SlidesListProps {
  slides: Slide[];
  onGenerateSingleImage: (idx: number) => void;
  aspectRatio: string;
}

export const SlidesList: React.FC<SlidesListProps> = ({ slides, onGenerateSingleImage, aspectRatio }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
      {slides.map((slide, idx) => (
        <SlideCard 
          key={idx} 
          slide={slide} 
          idx={idx} 
          onGenerateImage={() => onGenerateSingleImage(idx)} 
          aspectRatio={aspectRatio}
        />
      ))}
    </div>
  );
};

const SlideCard: React.FC<{ slide: Slide, idx: number, onGenerateImage: () => void, aspectRatio: string }> = ({ slide, idx, onGenerateImage, aspectRatio }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!slide.generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = slide.generatedImageUrl;
    link.download = `slide-${slide.pageNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "1:1": return "aspect-square";
      case "3:4": return "aspect-[3/4]";
      case "4:3": return "aspect-[4/3]";
      case "9:16": return "aspect-[9/16]";
      case "16:9": return "aspect-video";
      default: return "aspect-video";
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <div className={`${getAspectClass()} bg-slate-50 relative overflow-hidden border-b`}>
         {slide.generatedImageUrl ? (
           <img src={slide.generatedImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={`Slide ${idx + 1}`} />
         ) : (
           <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-200 p-6 text-center">
              {slide.isGeneratingImage ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-yellow-500" />
                  <span className="text-[9px] font-black uppercase text-yellow-500 tracking-widest">Generating...</span>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 stroke-[1px] opacity-40" />
                  <span className="text-[9px] font-black tracking-widest uppercase opacity-40">Visual Pending</span>
                </>
              )}
           </div>
         )}
         
         <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
            {slide.generatedImageUrl && (
              <button 
                onClick={handleDownload}
                className="bg-white/95 p-2.5 rounded-lg shadow-lg hover:scale-105 active:scale-95 border border-gray-100 text-slate-700 hover:text-blue-600 transition-all"
                title="下载"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={onGenerateImage}
              disabled={slide.isGeneratingImage}
              className="bg-white/95 p-2.5 rounded-lg shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 border border-gray-100"
              title="生成/重试"
            >
              <RefreshCw className={`w-4 h-4 ${slide.isGeneratingImage ? 'animate-spin text-yellow-500' : 'text-slate-800'}`} />
            </button>
         </div>
      </div>
      <div className="p-5 space-y-3 flex-1 flex flex-col">
         <div className="flex justify-between items-center">
            <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-widest">P.{slide.pageNumber}</span>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{slide.layout}</span>
         </div>
         <div className="space-y-1.5">
            <h4 className="text-base font-black text-slate-900 leading-tight">{slide.narrativeGoal}</h4>
            <div className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-4">
              {slide.keyContent}
            </div>
         </div>
         <div className="pt-3 border-t border-slate-50 mt-auto">
            <p className="text-[8px] font-bold text-slate-400 italic leading-relaxed uppercase tracking-wider line-clamp-2">
              <span className="text-yellow-500 not-italic mr-1 font-black underline decoration-yellow-100">PROMPT:</span> {slide.visual}
            </p>
         </div>
      </div>
    </div>
  );
};
