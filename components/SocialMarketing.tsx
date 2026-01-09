
import React from 'react';
import { Copy } from 'lucide-react';
import { SlideDeck } from '../types';

interface SocialMarketingProps {
  social: SlideDeck['socialMedia'];
}

export const SocialMarketing: React.FC<SocialMarketingProps> = ({ social }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-10 space-y-10">
           <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-between border-l-4 border-yellow-400 pl-4">
                小红书标题 (吸睛版)
                <button 
                  onClick={() => copyToClipboard(social.title)}
                  className="flex items-center gap-1.5 hover:text-slate-900 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border text-[10px]"
                >
                  <Copy className="w-3 h-3" /> 复制标题
                </button>
              </label>
              <div className="text-2xl font-black p-6 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-100 transition-all text-slate-900 leading-tight">
                {social.title}
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-between border-l-4 border-yellow-400 pl-4">
                正文文案
                <button 
                  onClick={() => copyToClipboard(social.intro + "\n\n" + social.tags.map((t: string)=>`#${t}`).join(' '))}
                  className="flex items-center gap-1.5 hover:text-slate-900 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border text-[10px]"
                >
                  <Copy className="w-3 h-3" /> 复制全文
                </button>
              </label>
              <div className="text-base text-slate-600 leading-[2] p-8 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-100 transition-all whitespace-pre-wrap font-medium">
                {social.intro}
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {social.tags.map((t: string, i: number) => <span key={i} className="text-blue-500 font-black hover:scale-105 transition-transform cursor-default">#{t}</span>)}
                </div>
              </div>
           </div>
        </div>
        <div className="bg-slate-900 p-8 flex justify-center items-center gap-4">
           <div className="h-px bg-slate-800 flex-1"></div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">SOCIAL CONFIGURATION MODULE</p>
           <div className="h-px bg-slate-800 flex-1"></div>
        </div>
      </div>
    </div>
  );
};
