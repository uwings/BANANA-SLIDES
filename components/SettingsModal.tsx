
import React, { useState } from 'react';
import { ChevronDown, RotateCcw, Save, Square, Tablet, Monitor, Smartphone, Layout } from 'lucide-react';
import { AppSettings, SettingsTabType } from '../types';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_SOCIAL_PROMPT, DEFAULT_STYLE_VARIABLES, DEFAULT_ASPECT_RATIO } from '../constants';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<SettingsTabType>('system');

  const handleReset = () => {
    if (confirm('确定要恢复系统默认设置吗？当前的修改将丢失。')) {
      setLocalSettings({
        ...localSettings,
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        socialPrompt: DEFAULT_SOCIAL_PROMPT,
        styleVariables: DEFAULT_STYLE_VARIABLES,
        aspectRatio: DEFAULT_ASPECT_RATIO as any
      });
    }
  };

  const tabs: {id: SettingsTabType, label: string}[] = [
    { id: 'system', label: '核心指令' },
    { id: 'style', label: '风格变量' },
    { id: 'social', label: '推广配置' },
    { id: 'image', label: '图片设置' },
  ];

  const aspectRatios: {id: AppSettings['aspectRatio'], label: string, icon: any}[] = [
    { id: "1:1", label: "1:1 正方形", icon: Square },
    { id: "3:4", label: "3:4 小红书", icon: Tablet },
    { id: "4:3", label: "4:3 复古", icon: Monitor },
    { id: "9:16", label: "9:16 竖屏", icon: Smartphone },
    { id: "16:9", label: "16:9 宽屏", icon: Layout },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-8 border-b flex items-center justify-between bg-gray-50/50">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900">配置中心</h3>
            <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-black">Advanced Prompt Engineering & System Logic</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-200">
            <ChevronDown className="w-8 h-8 text-slate-400" />
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Navigation */}
          <div className="w-48 border-r bg-gray-50/30 p-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-slate-900 border' : 'text-gray-400 hover:text-slate-600'}`}
              >
                {tab.label}
              </button>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <button 
                onClick={handleReset}
                className="w-full flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 恢复默认
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'system' && (
              <div className="space-y-4 animate-in fade-in duration-200 h-full flex flex-col">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">System Prompt (Slide Generation Logic)</label>
                <textarea 
                  value={localSettings.systemPrompt}
                  onChange={e => setLocalSettings({...localSettings, systemPrompt: e.target.value})}
                  className="flex-1 w-full min-h-[400px] p-6 bg-gray-50 rounded-xl border text-sm font-mono focus:bg-white transition-all outline-none focus:ring-4 focus:ring-yellow-400/20 leading-relaxed"
                />
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-4 animate-in fade-in duration-200 h-full flex flex-col">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Style Variables (Global Aesthetic)</label>
                <textarea 
                  value={localSettings.styleVariables}
                  onChange={e => setLocalSettings({...localSettings, styleVariables: e.target.value})}
                  className="flex-1 w-full min-h-[400px] p-6 bg-gray-50 rounded-xl border text-sm font-mono focus:bg-white transition-all outline-none focus:ring-4 focus:ring-yellow-400/20 leading-relaxed"
                />
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-4 animate-in fade-in duration-200 h-full flex flex-col">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Social Media Prompt (XHS Logic)</label>
                <textarea 
                  value={localSettings.socialPrompt}
                  onChange={e => setLocalSettings({...localSettings, socialPrompt: e.target.value})}
                  className="flex-1 w-full min-h-[400px] p-6 bg-gray-50 rounded-xl border text-sm font-mono focus:bg-white transition-all outline-none focus:ring-4 focus:ring-yellow-400/20 leading-relaxed"
                />
              </div>
            )}

            {activeTab === 'image' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">图片比例 (Aspect Ratio)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {aspectRatios.map(ar => (
                      <button
                        key={ar.id}
                        onClick={() => setLocalSettings({...localSettings, aspectRatio: ar.id})}
                        className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${localSettings.aspectRatio === ar.id ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-gray-100 hover:border-gray-200 text-slate-500'}`}
                      >
                        <ar.icon className="w-8 h-8" />
                        <span className="text-xs font-black uppercase tracking-widest">{ar.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Notice</p>
                  <p className="text-xs text-blue-500 font-medium leading-relaxed">比例将直接影响 AI 的构图。小红书封面建议使用 3:4。图片由 gemini-3-pro-image-preview 生成，支持极高画质和更准确的文字理解。</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 border-t bg-gray-50/50 flex justify-end gap-3">
          <button 
            onClick={() => onSave(localSettings)}
            className="px-12 py-5 bg-slate-900 text-white rounded-xl font-black tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 active:scale-95"
          >
            <Save className="w-5 h-5" /> 保存配置
          </button>
        </div>
      </div>
    </div>
  );
};
