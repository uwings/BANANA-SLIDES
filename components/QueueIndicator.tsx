
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface QueueIndicatorProps {
  queueLength: number;
  aspectRatio: string;
}

export const QueueIndicator: React.FC<QueueIndicatorProps> = ({ queueLength, aspectRatio }) => {
  if (queueLength === 0) return null;

  return (
    <div className="fixed bottom-10 right-10 z-50 bg-slate-900 text-white shadow-2xl rounded-2xl p-6 flex items-center gap-6 animate-in slide-in-from-right-10 duration-500 border border-slate-800">
      <div className="relative flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-yellow-400" />
        <span className="absolute text-[10px] font-black">{queueLength}</span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Rendering Scenes</p>
        <p className="text-sm font-bold text-slate-300">正在生成高画质 {aspectRatio} 图像...</p>
      </div>
    </div>
  );
};
