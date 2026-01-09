
import React from 'react';
import { History, FileUp, FileDown, Trash2, Plus } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  history: HistoryItem[];
  currentId: string | null;
  width: number;
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onNew: () => void;
  onResize: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen, history, currentId, width, onLoad, onDelete, onImport, onExport, onNew, onResize
}) => {
  return (
    <aside 
      style={{ width: isOpen ? width : 0 }}
      className={`fixed lg:relative z-40 h-full bg-white border-r transition-[width] duration-300 flex flex-col ${!isOpen ? '-translate-x-full lg:translate-x-0 overflow-hidden border-none' : 'translate-x-0'}`}
    >
      <div className="h-20 px-4 border-b flex items-center justify-between overflow-hidden whitespace-nowrap bg-gray-50/50 shrink-0">
        <span className="font-bold flex items-center gap-2 text-slate-700 uppercase tracking-tighter text-xs">
          <History className="w-3.5 h-3.5" /> 历史记录
        </span>
        <div className="flex gap-2">
          <label className="flex items-center gap-1.5 px-2 py-1 hover:bg-white rounded border border-transparent hover:border-gray-200 cursor-pointer transition-all" title="导入">
            <FileUp className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[10px] font-bold text-gray-600">导入</span>
            <input type="file" className="hidden" accept=".json" onChange={onImport} />
          </label>
          <button 
            onClick={onExport} 
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-all" 
            title="导出"
          >
            <FileDown className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[10px] font-bold text-gray-600">导出</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
        {history.length === 0 && (
          <div className="text-center py-10 opacity-30 text-[10px] font-medium">暂无记录</div>
        )}
        {history.map(item => (
          <div 
            key={item.id} 
            onClick={() => onLoad(item)}
            className={`group relative p-2.5 rounded-lg cursor-pointer border transition-all ${currentId === item.id ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
          >
            <h4 className="text-xs font-bold truncate pr-6 text-slate-800">{item.deck.title}</h4>
            <div className="flex justify-between items-center mt-1">
              <p className="text-[9px] text-gray-400 font-medium">{new Date(item.timestamp).toLocaleString([], {month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'})}</p>
              <span className="text-[9px] bg-white px-1 py-0.5 rounded border font-bold text-gray-500">{item.deck.slides.length}P</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              className="absolute top-2.5 right-2 p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all bg-white/80 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t bg-gray-50/30 shrink-0">
        <button 
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white border rounded-lg hover:bg-yellow-50 hover:border-yellow-200 transition-all font-bold text-xs text-slate-700 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> 开启新创作
        </button>
      </div>

      {/* Resizer Handle */}
      {isOpen && (
        <div 
          onMouseDown={onResize}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize resizer-handle transition-colors z-50"
        />
      )}
    </aside>
  );
};
