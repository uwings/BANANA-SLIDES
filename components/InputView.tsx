
import React from 'react';
import { Search, Send, RefreshCw } from 'lucide-react';

interface InputViewProps {
  userInput: string;
  importUrl: string;
  isGenerating: boolean;
  onUserInputChange: (val: string) => void;
  onImportUrlChange: (val: string) => void;
  onImport: () => void;
  onGenerate: () => void;
}

export const InputView: React.FC<InputViewProps> = ({
  userInput, importUrl, isGenerating, onUserInputChange, onImportUrlChange, onImport, onGenerate
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-5xl mx-auto space-y-4 py-2">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">让演示，回归叙事。</h2>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Deep context processing for professional slide decks.</p>
      </div>

      <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="粘贴链接 (支持自动 Markdown 转换)" 
              className="w-full pl-10 pr-36 py-3.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
              value={importUrl}
              onChange={e => onImportUrlChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onImport()}
            />
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-300" />
            <button 
              onClick={onImport}
              disabled={!importUrl}
              className="absolute right-1.5 top-1.5 bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-30 transition-all"
            >
              导入链接
            </button>
          </div>

          <textarea 
            className="w-full h-[450px] p-6 bg-gray-50/50 rounded-lg outline-none text-slate-800 placeholder:text-gray-300 resize-none font-medium leading-relaxed border border-transparent focus:border-yellow-200 focus:bg-white transition-all text-base"
            placeholder="粘贴您的原始素材、构思或大纲... 支持长文本输入。"
            value={userInput}
            onChange={e => onUserInputChange(e.target.value)}
          />
        </div>
        
        <div className="p-4 bg-gray-50/30 border-t flex justify-end">
          <button 
            onClick={onGenerate}
            disabled={isGenerating || !userInput.trim()}
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-8 py-3.5 rounded-lg font-black flex items-center gap-3 shadow-lg shadow-yellow-100 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale text-sm"
          >
            {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isGenerating ? '正在深度构建内容结构...' : '立即生成完整方案'}
          </button>
        </div>
      </div>
    </div>
  );
};
