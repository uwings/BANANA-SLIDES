
import React, { useState } from 'react';
import { ChevronDown, RotateCcw, Save, Square, Tablet, Monitor, Smartphone, Layout, Key, Eye, EyeOff, Copy, Check, ExternalLink, Palette, Sparkles } from 'lucide-react';
import { AppSettings, SettingsTabType } from '../types';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_SOCIAL_PROMPT, DEFAULT_STYLE_VARIABLES, DEFAULT_ASPECT_RATIO, DEFAULT_INFOGRAPHIC_OUTLINE_PROMPT, DEFAULT_INFOGRAPHIC_DETAIL_PROMPT, STYLE_TEMPLATES } from '../constants';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<SettingsTabType>('apikey');
  const [showKey, setShowKey] = useState(false);

  const handleReset = () => {
    if (confirm('确定要恢复系统默认设置吗？当前的修改将丢失。')) {
      setLocalSettings({
        ...localSettings,
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        socialPrompt: DEFAULT_SOCIAL_PROMPT,
        styleVariables: STYLE_TEMPLATES.default,
        aspectRatio: DEFAULT_ASPECT_RATIO as any,
        infographicOutlinePrompt: DEFAULT_INFOGRAPHIC_OUTLINE_PROMPT,
        infographicDetailPrompt: DEFAULT_INFOGRAPHIC_DETAIL_PROMPT
      });
    }
  };

  const tabs: {id: SettingsTabType, label: string}[] = [
    { id: 'apikey', label: 'API 密钥' },
    { id: 'system', label: '核心指令' },
    { id: 'style', label: '风格变量' },
    { id: 'social', label: '推广配置' },
    { id: 'image', label: '图片设置' },
    { id: 'infographic', label: '信息图配置' },
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
            {activeTab === 'apikey' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={localSettings.apiKey}
                      onChange={e => setLocalSettings({...localSettings, apiKey: e.target.value})}
                      placeholder="输入你的 Gemini API 密钥"
                      className="w-full p-4 pr-24 bg-gray-50 rounded-xl border text-sm font-mono focus:bg-white transition-all outline-none focus:ring-4 focus:ring-yellow-400/20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(localSettings.apiKey)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="复制"
                      >
                        <Copy className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title={showKey ? '隐藏' : '显示'}
                      >
                        {showKey ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 space-y-2">
                  <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">How to get API Key</p>
                  <ol className="text-xs text-yellow-700 leading-relaxed list-decimal list-inside space-y-1">
                    <li>访问 Google AI Studio</li>
                    <li>点击 "Get API Key" 创建密钥</li>
                    <li>确保已启用结算功能</li>
                  </ol>
                  <a
                    href="https://ai.google.dev/gemini-api/docs/api-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600 hover:text-yellow-700 transition-colors mt-2"
                  >
                    查看详细教程 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Security Notice</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    您的 API 密钥仅保存在浏览器本地存储 (localStorage) 中，不会发送到我们的服务器。
                    请勿与他人分享您的密钥。
                  </p>
                </div>
              </div>
            )}

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
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Style Templates */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">风格模板</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STYLE_TEMPLATES).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setLocalSettings({...localSettings, styleVariables: value})}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          localSettings.styleVariables === value
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {key === 'default' && <span className="mr-1">✨</span>}
                        {key === 'minimal' && <span className="mr-1">◻️</span>}
                        {key === 'tech' && <span className="mr-1">🔮</span>}
                        {key === 'warm' && <span className="mr-1">💛</span>}
                        {key === 'business' && <span className="mr-1">💼</span>}
                        {key === 'creative' && <span className="mr-1">🎨</span>}
                        {key === 'kawaii' && <span className="mr-1">🌸</span>}
                        {key === 'mono' && <span className="mr-1">◐</span>}
                        {key === 'film' && <span className="mr-1">📷</span>}
                        {key === 'dodocotton' && <span className="mr-1">☁️</span>}
                        {key === 'watercolor' && <span className="mr-1">🎨</span>}
                        {key === 'glass' && <span className="mr-1">🫧</span>}
                        {key === 'allie_brosh' && <span className="mr-1">😜</span>}
                        {key === 'sarah_andersen' && <span className="mr-1">💬</span>}
                        {key === 'mattias_adolfsson' && <span className="mr-1">🔮</span>}
                        {key === 'george_barbier' && <span className="mr-1">✨</span>}
                        {key === 'ivan_bilibin' && <span className="mr-1">📖</span>}
                        {key === 'default' ? '默认' : key === 'minimal' ? '极简' : key === 'tech' ? '科技' : key === 'warm' ? '温暖' : key === 'business' ? '商务' : key === 'creative' ? '创意' : key === 'kawaii' ? '可爱' : key === 'mono' ? '黑白' : key === 'film' ? '胶片' : key === 'dodocotton' ? '棉麻' : key === 'watercolor' ? '水彩' : key === 'glass' ? '玻璃' : key === 'allie_brosh' ? 'Allie' : key === 'sarah_andersen' ? 'Sarah' : key === 'mattias_adolfsson' ? '幻想' : key === 'george_barbier' ? '装饰' : key === 'ivan_bilibin' ? '古典' : key.charAt(0).toUpperCase() + key.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Style Variables */}
                <div className="flex-1 flex flex-col">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-3">自定义风格变量</label>
                  <textarea
                    value={localSettings.styleVariables}
                    onChange={e => setLocalSettings({...localSettings, styleVariables: e.target.value})}
                    className="flex-1 w-full min-h-[300px] p-4 bg-gray-50 rounded-xl border text-sm font-mono focus:bg-white transition-all outline-none focus:ring-4 focus:ring-yellow-400/20 leading-relaxed"
                    placeholder="Design Aesthetic: ...
Background Color: ...
Primary Font: ...
Secondary Font: ...
Color Palette:
    Primary Text Color: ...
    Primary Accent Color: ...
Visual Elements: ..."
                  />
                </div>

                {/* Style Guide */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Style Guide</p>
                  <p className="text-xs text-blue-500 leading-relaxed">
                    <strong>Design Aesthetic:</strong> 描述整体风格倾向<br/>
                    <strong>Background Color:</strong> 十六进制颜色代码<br/>
                    <strong>Primary/Secondary Font:</strong> 字体名称<br/>
                    <strong>Color Palette:</strong> 主色调和强调色<br/>
                    <strong>Visual Elements:</strong> 视觉元素描述
                  </p>
                </div>
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

            {activeTab === 'infographic' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 信息图大纲 Prompt */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                    信息图大纲生成 Prompt
                  </label>
                  <textarea
                    value={localSettings.infographicOutlinePrompt}
                    onChange={e => setLocalSettings({...localSettings, infographicOutlinePrompt: e.target.value})}
                    className="w-full min-h-[300px] p-6 bg-gray-50 rounded-xl border text-sm font-mono focus:bg-white transition-all outline-none focus:ring-4 focus:ring-yellow-400/20 leading-relaxed"
                    placeholder="信息图大纲生成 Prompt..."
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    用于生成信息图的结构化大纲，包括章节划分和核心要点。
                  </p>
                </div>

                {/* 信息图详情 Prompt */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                    信息图详情生成 Prompt
                  </label>
                  <textarea
                    value={localSettings.infographicDetailPrompt}
                    onChange={e => setLocalSettings({...localSettings, infographicDetailPrompt: e.target.value})}
                    className="w-full min-h-[300px] p-6 bg-gray-50 rounded-xl border text-sm font-mono focus:bg-white transition-all outline-none focus:ring-4 focus:ring-yellow-400/20 leading-relaxed"
                    placeholder="信息图详情生成 Prompt..."
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    基于大纲生成详细的卡片内容，包括高密度信息和竖屏布局。
                  </p>
                </div>

                {/* 提示信息 */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">信息图模式说明</p>
                  <ul className="text-xs text-blue-500 space-y-1 leading-relaxed">
                    <li>• 大纲 Prompt 先生成 3-8 个章节的结构</li>
                    <li>• 详情 Prompt 基于大纲生成详细的卡片内容</li>
                    <li>• 支持双语输出：中文在前，英文原文在括号内</li>
                    <li>• 竖屏优化：适合移动端浏览</li>
                  </ul>
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
