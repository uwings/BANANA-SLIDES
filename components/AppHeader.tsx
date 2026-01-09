
import React from 'react';
import { Layout, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { ViewType } from '../types';

interface AppHeaderProps {
  view: ViewType;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onEditNarrative: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  view,
  isSidebarOpen,
  onToggleSidebar,
  onOpenSettings,
  onEditNarrative
}) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-6">
        <button
          onClick={onToggleSidebar}
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
            onClick={onEditNarrative}
            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-all bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg uppercase tracking-widest active:scale-95 ml-4"
          >
            <ArrowLeft className="w-4 h-4" /> 编辑文稿
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSettings}
          className="p-3 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-90"
        >
          <SettingsIcon className="w-6 h-6 text-slate-500" />
        </button>
      </div>
    </header>
  );
};
