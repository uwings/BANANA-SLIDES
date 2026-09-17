
import React from 'react';
import { Search, Send, RefreshCw, Terminal, Eye } from 'lucide-react';

interface InputViewProps {
  userInput: string;
  importUrl: string;
  isGenerating: boolean;
  progressLog?: string;
  hasExistingDeck: boolean;
  onUserInputChange: (val: string) => void;
  onImportUrlChange: (val: string) => void;
  onImport: () => void;
  onGenerate: () => void;
  onViewResults: () => void;
  generationMode: 'slide' | 'infographic';
  onModeChange: (mode: 'slide' | 'infographic') => void;
}

export const InputView: React.FC<InputViewProps> = ({
  userInput, importUrl, isGenerating, progressLog, hasExistingDeck,
  onUserInputChange, onImportUrlChange, onImport, onGenerate, onViewResults,
  generationMode, onModeChange
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-5xl mx-auto space-y-4 py-2 h-full flex flex-col">
      <div className="text-center space-y-1 shrink-0">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">让演示，回归叙事。</h2>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Deep context processing for professional slide decks.</p>
      </div>

      {/* 模式选择器 */}
      <div className="bg-white rounded-xl shadow-lg border p-3">
        <div className="flex gap-2">
          <button
            onClick={() => onModeChange('slide')}
            className={`flex-1 px-4 py-3 rounded-lg font-black text-sm transition-all ${
              generationMode === 'slide'
                ? 'bg-yellow-400 text-slate-900 shadow-lg scale-105'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            📽️ 幻灯片模式
            <div className="text-[9px] font-normal mt-1 opacity-70">
              叙事性演示文稿，5-15页
            </div>
          </button>
          <button
            onClick={() => onModeChange('infographic')}
            className={`flex-1 px-4 py-3 rounded-lg font-black text-sm transition-all ${
              generationMode === 'infographic'
                ? 'bg-yellow-400 text-slate-900 shadow-lg scale-105'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            📊 信息图模式
            <div className="text-[9px] font-normal mt-1 opacity-70">
              高密度信息图，3-8张卡片
            </div>
          </button>
        </div>
      </div>

      {/* Progress Log Display */}
      {isGenerating && progressLog && (
        <div className="bg-slate-900 rounded-lg p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shrink-0">
          <Terminal className="w-4 h-4 text-yellow-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-mono text-yellow-400 uppercase tracking-wider">System Log</p>
            <p className="text-sm text-slate-300 font-medium">{progressLog}</p>
          </div>
          <RefreshCw className="w-4 h-4 text-slate-500 animate-spin" />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="p-4 space-y-4 flex flex-col flex-1 min-h-0">
          <div className="relative group shrink-0">
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
            className="flex-1 w-full p-6 bg-gray-50/50 rounded-lg outline-none text-slate-800 placeholder:text-gray-300 resize-none font-medium leading-relaxed border border-transparent focus:border-yellow-200 focus:bg-white transition-all text-base min-h-0"
            placeholder="粘贴您的原始素材、构思或大纲... 支持长文本输入。"
            value={userInput}
            onChange={e => onUserInputChange(e.target.value)}
          />
        </div>

        <div className="p-4 bg-gray-50/30 border-t shrink-0">
          <div className="flex gap-3">
            {hasExistingDeck && (
              <button
                onClick={onViewResults}
                className="flex-1 border border-slate-200 bg-white hover:bg-gray-50 text-slate-700 px-8 py-3.5 rounded-lg font-black flex items-center gap-3 shadow-sm transition-all active:scale-95 text-sm"
              >
                <Eye className="w-5 h-5" />
                查看已生成方案
              </button>
            )}
            <button
              onClick={onGenerate}
              disabled={isGenerating || !userInput.trim()}
              className={`${hasExistingDeck ? 'flex-1' : 'w-full'} bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-8 py-3.5 rounded-lg font-black flex items-center justify-center gap-3 shadow-lg shadow-yellow-100 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale text-sm`}
            >
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isGenerating ? '正在深度构建内容结构...' : (hasExistingDeck ? '重新生成方案' : '立即生成完整方案')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
