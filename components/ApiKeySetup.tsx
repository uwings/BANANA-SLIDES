
import React, { useState } from 'react';
import { Key, ExternalLink, Check, X, Loader2 } from 'lucide-react';

interface ApiKeySetupProps {
  apiKeyInput: string;
  setApiKeyInput: (value: string) => void;
  isTestingKey: boolean;
  keyTestResult: 'valid' | 'invalid' | null;
  onTestApiKey: () => void;
  onStartUsing: () => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({
  apiKeyInput,
  setApiKeyInput,
  isTestingKey,
  keyTestResult,
  onTestApiKey,
  onStartUsing
}) => {
  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 border border-slate-700 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-4 bg-yellow-400 rounded-full">
            <Key className="w-10 h-10 text-slate-900" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">配置 Gemini API 密钥</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            为了使用 BananaSlides AI 生成高画质图像和深度叙事内容，请输入您的 Google Gemini API 密钥。
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={keyTestResult === 'valid' ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKeyInput(e.target.value)}
              placeholder="输入你的 Gemini API 密钥"
              className="w-full p-4 pr-12 bg-slate-700 rounded-xl border border-slate-600 text-white placeholder-slate-400 focus:bg-slate-600 transition-all outline-none focus:ring-4 focus:ring-yellow-400/20"
            />
            <button
              type="button"
              onClick={() => setApiKeyInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            >
              {keyTestResult === 'valid' ? (
                <Check className="w-6 h-6 text-green-400" />
              ) : (
                <Key className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>

          <button
            onClick={onTestApiKey}
            disabled={isTestingKey || !apiKeyInput.trim()}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 py-3 rounded-xl font-black text-base shadow-xl shadow-yellow-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isTestingKey ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> 测试中...
              </>
            ) : (
              <>测试密钥</>
            )}
          </button>

          {keyTestResult === 'invalid' && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-xl flex items-center gap-2 text-red-300 text-sm">
              <X className="w-4 h-4 shrink-0" />
              <span>API 密钥无效，请检查后重试</span>
            </div>
          )}

          {keyTestResult === 'valid' && (
            <button
              onClick={onStartUsing}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-black text-base shadow-xl shadow-green-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" /> 开始使用
            </button>
          )}
        </div>

        <a
          href="https://ai.google.dev/gemini-api/docs/api-key"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors py-2"
        >
          获取 API 密钥 <ExternalLink className="w-3 h-3" />
        </a>

        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Notice</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            您的密钥保存在浏览器本地，我们不会在服务器上存储您的任何个人信息。
          </p>
        </div>
      </div>
    </div>
  );
};
