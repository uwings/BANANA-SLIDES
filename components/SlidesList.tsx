
import React, { useState } from 'react';
import { Download, RefreshCw, Check, ChevronDown } from 'lucide-react';
import { Slide, StyleTemplateKey } from '../types';
import { STYLE_TEMPLATES } from '../constants';

interface SlidesListProps {
  slides: Slide[];
  onGenerateSingleImage: (idx: number, customStyle?: string, styleKey?: string) => void;
  aspectRatio: string;
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
  <div className="col-span-full p-8 bg-red-50 rounded-2xl border border-red-200 text-center">
    <p className="text-red-600 font-medium">幻灯片数据异常，请返回重新生成</p>
  </div>
);

export const SlidesList: React.FC<SlidesListProps> = ({ slides, onGenerateSingleImage, aspectRatio }) => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
        {Array.isArray(slides) && slides.map((slide, idx) => (
          <SlideCard
            key={idx}
            slide={slide}
            idx={idx}
            onGenerateImage={(customStyle, styleKey) => onGenerateSingleImage(idx, customStyle, styleKey)}
            aspectRatio={aspectRatio}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
};

const styleOptions: { key: StyleTemplateKey; label: string; emoji: string; preview: string }[] = [
  { key: 'default', label: '默认', emoji: '✨', preview: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400&h=300&fit=crop' },
  { key: 'minimal', label: '极简', emoji: '◻️', preview: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=300&fit=crop' },
  { key: 'tech', label: '科技', emoji: '🔮', preview: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop' },
  { key: 'warm', label: '温暖', emoji: '💛', preview: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop' },
  { key: 'business', label: '商务', emoji: '💼', preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop' },
  { key: 'creative', label: '创意', emoji: '🎨', preview: 'https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=400&h=300&fit=crop' },
  { key: 'kawaii', label: '可爱', emoji: '🌸', preview: 'https://images.unsplash.com/photo-1498542567283-07c7c4a03b5c?w=400&h=300&fit=crop' },
  { key: 'mono', label: '黑白', emoji: '◐', preview: 'https://images.unsplash.com/photo-1515096788709-a3cf4ce0a4a6?w=400&h=300&fit=crop&grayscale' },
  { key: 'film', label: '胶片', emoji: '📷', preview: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop' },
  { key: 'dodocotton', label: '棉麻', emoji: '☁️', preview: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400&h=300&fit=crop' },
  { key: 'watercolor', label: '水彩', emoji: '🎨', preview: 'https://images.unsplash.com/photo-1579783902614-a3fb39279c42?w=400&h=300&fit=crop' },
  { key: 'glass', label: '玻璃', emoji: '🫧', preview: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=300&fit=crop' },
  { key: 'allie_brosh', label: 'Allie', emoji: '😜', preview: 'https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?w=400&h=300&fit=crop' },
  { key: 'sarah_andersen', label: 'Sarah', emoji: '💬', preview: 'https://images.unsplash.com/photo-1515096788709-a3cf4ce0a4a6?w=400&h=300&fit=crop' },
  { key: 'mattias_adolfsson', label: '幻想', emoji: '🔮', preview: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop' },
  { key: 'george_barbier', label: '装饰', emoji: '✨', preview: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=300&fit=crop' },
  { key: 'ivan_bilibin', label: '古典', emoji: '📖', preview: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&h=300&fit=crop' },
];

const SlideCard: React.FC<{
  slide: Slide;
  idx: number;
  onGenerateImage: (customStyle?: string, styleKey?: string) => void;
  aspectRatio: string;
}> = ({ slide, idx, onGenerateImage, aspectRatio }) => {
  // Use the stored styleKey if the image is already generated, otherwise use default
  const [selectedStyle, setSelectedStyle] = useState<StyleTemplateKey>(slide.styleKey || 'default');

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

  const handleStyleSelect = (styleKey: StyleTemplateKey) => {
    setSelectedStyle(styleKey);
  };

  const handleGenerate = () => {
    const styleValue = STYLE_TEMPLATES[selectedStyle];
    onGenerateImage(styleValue, selectedStyle);
  };

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

  // 左上角下拉选择状态
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <div className={`${getAspectClass()} bg-slate-50 relative overflow-hidden border-b`}>
         {slide.generatedImageUrl ? (
           <>
             <img src={slide.generatedImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={`Slide ${idx + 1}`} />

             {/* 已生成图片时的风格选择下拉框 */}
             <div className="absolute top-2 left-2 z-10">
               <div className="relative">
                 <button
                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                   className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow-lg border border-gray-200 hover:scale-105 active:scale-95 transition-all"
                 >
                   <span className="text-xs">{styleOptions.find(s => s.key === (slide.styleKey || 'default'))?.emoji}</span>
                   <span className="text-[10px] font-bold text-slate-700">{styleOptions.find(s => s.key === (slide.styleKey || 'default'))?.label}</span>
                   <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>

                 {isDropdownOpen && (
                   <>
                     <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                     <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 min-w-[120px]">
                       {styleOptions.map((option) => (
                         <button
                           key={option.key}
                           onClick={() => {
                             setSelectedStyle(option.key);
                             setIsDropdownOpen(false);
                             const styleValue = STYLE_TEMPLATES[option.key];
                             onGenerateImage(styleValue, option.key);
                           }}
                           className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${(slide.styleKey || 'default') === option.key ? 'bg-yellow-50 text-yellow-700' : ''}`}
                         >
                           <span>{option.emoji}</span>
                           <span>{option.label}</span>
                         </button>
                       ))}
                     </div>
                   </>
                 )}
               </div>
             </div>
           </>
         ) : (
           <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-200 p-6 text-center relative">
              {slide.isGeneratingImage ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-yellow-500" />
                  <span className="text-[9px] font-black uppercase text-yellow-500 tracking-widest">Generating...</span>
                </div>
              ) : (
                // 未生成图片时的风格选择
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
                  {/* Unsplash 预览图 - 模糊效果 */}
                  <img
                    src={styleOptions.find(s => s.key === selectedStyle)?.preview || styleOptions[0].preview}
                    alt="风格预览"
                    className="w-full h-full absolute inset-0 object-cover transition-all duration-500 blur-xl scale-110"
                  />
                  <div className="absolute inset-0 bg-white/30" />

                  {/* 当前选中风格标签 */}
                  <div className="relative z-10 mb-3">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest bg-white/90 px-3 py-1.5 rounded-full shadow-lg">
                      {styleOptions.find(s => s.key === selectedStyle)?.emoji} {styleOptions.find(s => s.key === selectedStyle)?.label}
                    </span>
                  </div>

                  {/* 风格选择网格 */}
                  <div className="relative z-10 grid grid-cols-3 gap-2 w-full max-w-xs">
                    {styleOptions.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => handleStyleSelect(option.key)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all active:scale-95 ${
                          selectedStyle === option.key
                            ? 'border-yellow-400 bg-white shadow-lg scale-105'
                            : 'border-slate-200 hover:border-yellow-300 bg-white/80'
                        }`}
                      >
                        <span className="text-xl">{option.emoji}</span>
                        <span className="text-[10px] font-bold text-slate-600">{option.label}</span>
                        {selectedStyle === option.key && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 立即生成按钮 */}
                  <button
                    onClick={handleGenerate}
                    disabled={slide.isGeneratingImage}
                    className="relative z-10 mt-4 px-10 py-3 bg-yellow-400 text-slate-900 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-yellow-500 hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                  >
                    立即生成
                  </button>
                </div>
              )}
           </div>
         )}

         <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
            {slide.generatedImageUrl && (
              <button
                onClick={handleDownload}
                className="bg-white/95 p-2.5 rounded-lg shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 border border-gray-100 text-slate-700 hover:text-blue-600 transition-all"
                title="下载"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              disabled={slide.isGeneratingImage}
              className="bg-yellow-400 p-2.5 rounded-lg shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 border border-yellow-300"
              title="使用选中风格生成"
            >
              <RefreshCw className={`w-4 h-4 ${slide.isGeneratingImage ? 'animate-spin' : ''}`} />
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
