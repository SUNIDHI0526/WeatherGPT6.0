import React, { useState } from 'react';
import { CloudSun, Mic, MessageSquare, Globe, Check, ArrowRight, Sparkles } from 'lucide-react';
import { LanguageCode } from '../types/weather';

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: (preferredMode: 'voice' | 'text', language: LanguageCode) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onComplete }) => {
  const [selectedMode, setSelectedMode] = useState<'voice' | 'text'>('text');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Top visual */}
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 mb-3">
            <CloudSun className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 uppercase tracking-wider">
            SIH 2026 Problem Statement 26068
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2 font-['Outfit']">
            Welcome to WeatherGPT
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Your conversational weather companion for <span className="font-semibold text-slate-700">Nagpur District, Maharashtra</span>.
          </p>
        </div>

        {/* Step 1: Interaction preference */}
        <div className="mt-6">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            1. How would you like to interact?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMode('text')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-start ${
                selectedMode === 'text'
                  ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">💬 Text Chat</span>
              <span className="text-[11px] text-slate-500 mt-0.5 leading-tight">Type in English, Hindi, Hinglish, Marathi</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('voice')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-start ${
                selectedMode === 'voice'
                  ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                <Mic className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">🎙️ Voice First</span>
              <span className="text-[11px] text-slate-500 mt-0.5 leading-tight">Speak directly in your native language</span>
            </button>
          </div>
        </div>

        {/* Step 2: Language Selection */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              2. Preferred Language
            </label>
            <span className="text-[10px] text-sky-600 font-medium">Auto-detect also active</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'en' as LanguageCode, label: 'English', sub: 'Default' },
              { code: 'hi' as LanguageCode, label: 'हिंदी', sub: 'Hindi / Hinglish' },
              { code: 'mr' as LanguageCode, label: 'मराठी', sub: 'Marathi' },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLanguage(lang.code)}
                className={`py-2 px-2 rounded-xl border text-center transition-all ${
                  selectedLanguage === lang.code
                    ? 'border-sky-500 bg-sky-50/80 font-bold text-sky-700 ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs block font-bold">{lang.label}</span>
                <span className="text-[9px] text-slate-400 block">{lang.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trust badge */}
        <div className="mt-5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Real-time weather data retrieved from verified meteorological sources. Never AI-hallucinated.</span>
        </div>

        {/* Get Started Button */}
        <button
          type="button"
          onClick={() => onComplete(selectedMode, selectedLanguage)}
          className="mt-5 w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Enter WeatherGPT Nagpur</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
