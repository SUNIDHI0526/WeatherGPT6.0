import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, VolumeX, Sparkles, RefreshCw, User, Bot, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { ChatMessage, WeatherData, AlertData, LocalRiskIndex, RouteWeather, UserProfileType, LanguageCode } from '../../types/weather';
import { WeatherCard } from '../cards/WeatherCard';
import { ForecastCard } from '../cards/ForecastCard';
import { AlertCard } from '../cards/AlertCard';
import { RiskCard } from '../cards/RiskCard';
import { RouteCard } from '../cards/RouteCard';
import { AdviceCard } from '../cards/AdviceCard';

interface ChatScreenProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  onOpenVoiceModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeProfile: UserProfileType;
  selectedLanguage: LanguageCode;
  onClearHistory?: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  onSendMessage,
  isThinking,
  onOpenVoiceModal,
  soundEnabled,
  onToggleSound,
  activeProfile,
  selectedLanguage,
  onClearHistory
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSpeakText = (id: string, text: string, langCode: string = 'en') => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingId === id) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Map language tag for speech synthesis
    if (langCode === 'hi' || langCode === 'hinglish') utterance.lang = 'hi-IN';
    else if (langCode === 'mr' || langCode === 'mr-latin') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-IN';

    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    setCurrentlySpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const sampleQuestions = [
    { label: '🌧️ Will it rain tomorrow?', q: 'Will it rain tomorrow in Nagpur?' },
    { label: '🇮🇳 Kal baarish hogi kya?', q: 'Kal Nagpur mein baarish hogi kya?' },
    { label: '🚩 Udhya paus padel ka?', q: 'उद्या नागपूरमध्ये पाऊस पडेल का?' },
    { label: '☂️ Carry umbrella?', q: 'Aaj umbrella leke jaana chahiye kya?' },
    { label: '🛣️ Nagpur to Kamptee route', q: 'Is it safe to travel from Nagpur to Kamptee at 6 PM?' },
    { label: '🔔 Explain active alert', q: 'Why did I receive this alert in Nagpur?' },
    { label: '🎒 College travel safety', q: 'Mujhe college jaana hai, weather safe hai kya?' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-xl mx-auto pb-2">
      {/* Top Chat Info bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs mb-2">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Bot className="w-4 h-4 text-sky-600" />
          <span className="font-semibold text-slate-800">WeatherGPT Assistant</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-700 font-medium">Nagpur</span>
        </div>
        <div className="flex items-center gap-2">
          {onClearHistory && messages.length > 2 && (
            <button
              onClick={onClearHistory}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
            >
              Clear chat
            </button>
          )}
          <span className="text-[10px] text-slate-400 font-medium">
            Profile: <span className="font-bold text-slate-700 capitalize">{activeProfile}</span>
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = currentlySpeakingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-in fade-in duration-200`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[92%] rounded-2xl p-3.5 text-sm shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-br-xs font-medium'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                }`}
              >
                {/* Header row for bot */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700">
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      <span>WeatherGPT</span>
                      {msg.detectedLanguage && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 uppercase">
                          {msg.detectedLanguage}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleSpeakText(msg.id, msg.text, msg.detectedLanguage)}
                      className={`p-1 rounded-md text-xs flex items-center gap-1 transition-colors ${
                        isSpeaking ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium">{isSpeaking ? 'Stop' : 'Listen'}</span>
                    </button>
                  </div>
                )}

                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </p>

                {/* Sources attribution */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Source: {msg.sources[0]}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>

              {/* Dynamic Embedded Cards */}
              {!isUser && msg.cards && (
                <div className="w-full max-w-[95%] space-y-2 mt-1">
                  {msg.cards.weather && (
                    <WeatherCard weather={msg.cards.weather} onAskMore={(q) => onSendMessage(q)} />
                  )}
                  {msg.cards.alert && (
                    <AlertCard alert={msg.cards.alert} initialExpanded={true} />
                  )}
                  {msg.cards.route && (
                    <RouteCard route={msg.cards.route} />
                  )}
                  {msg.cards.risk && (
                    <RiskCard risk={msg.cards.risk} compact={false} />
                  )}
                  {msg.cards.forecast && (
                    <ForecastCard hourly={msg.cards.forecast} />
                  )}
                  {msg.cards.advice && (
                    <AdviceCard advice={msg.cards.advice} />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Real-time Tool Calling / Thinking State */}
        {isThinking && (
          <div className="flex items-start gap-2 animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-bl-xs p-3.5 shadow-xs max-w-[85%]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <RefreshCw className="w-3.5 h-3.5 text-sky-500 animate-spin" />
                <span>Checking live telemetry for Nagpur District...</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Querying Open-Meteo & computing Nagpur Local Risk Index
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Drawer */}
      <div className="py-1.5 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0 px-0.5">
        {sampleQuestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(item.q)}
            className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100/90 hover:bg-slate-200 active:scale-95 text-slate-700 font-medium whitespace-nowrap transition-all border border-slate-200/60"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="mt-1 flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onOpenVoiceModal}
          className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition-all shrink-0 border border-slate-200"
          title="Speak to WeatherGPT"
        >
          <Mic className="w-5 h-5 text-indigo-600" />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask WeatherGPT in English, हिंदी, मराठी..."
            className="w-full h-11 pl-4 pr-10 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-xs transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isThinking}
          className="w-11 h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
