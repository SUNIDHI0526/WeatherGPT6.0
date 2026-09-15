import React, { useState } from 'react';
import { Settings, User, Globe, Bell, Smartphone, Database, CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';
import { UserProfileType, LanguageCode } from '../../types/weather';

interface SettingsScreenProps {
  activeProfile: UserProfileType;
  onSelectProfile: (profile: UserProfileType) => void;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onTestNotification: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  activeProfile,
  onSelectProfile,
  selectedLanguage,
  onSelectLanguage,
  isDemoMode,
  onToggleDemoMode,
  onTestNotification
}) => {
  const [smsInput, setSmsInput] = useState('Kal baarish hogi kya?');
  const [smsResponse, setSmsResponse] = useState<string | null>(null);
  const [isSendingSms, setIsSendingSms] = useState(false);

  const profiles: { id: UserProfileType; label: string; desc: string; icon: string }[] = [
    { id: 'student', label: 'Student', desc: 'Campus transit, exam alerts, bag waterproofing', icon: '🎒' },
    { id: 'commuter', label: 'Daily Commuter', desc: 'Wardha Rd / Ring Rd traffic, two-wheeler warnings', icon: '🛵' },
    { id: 'farmer', label: 'Farmer (Vidarbha)', desc: 'Crop spraying, rainfall timing, cotton & orange care', icon: '🌾' },
    { id: 'worker', label: 'Outdoor Worker', desc: 'Heat index, direct UV safety, heavy rain alerts', icon: '👷' },
    { id: 'traveller', label: 'Traveller / Transit', desc: 'Highways, corridor risks, departure planning', icon: '🧳' },
    { id: 'event', label: 'Event Organizer', desc: 'Outdoor gathering viability, storm warnings', icon: '🎪' },
    { id: 'general', label: 'General Resident', desc: 'Daily weather summaries and umbrella advisories', icon: '👤' }
  ];

  const languages: { code: LanguageCode; label: string; sub: string }[] = [
    { code: 'en', label: 'English', sub: 'Default' },
    { code: 'hi', label: 'हिंदी', sub: 'Devanagari' },
    { code: 'hinglish', label: 'Hinglish', sub: 'Romanized Hindi' },
    { code: 'mr', label: 'मराठी', sub: 'Devanagari' }
  ];

  const handleSimulateSms = async () => {
    if (!smsInput.trim()) return;
    setIsSendingSms(true);
    try {
      const res = await fetch('/api/sms/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: smsInput })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setSmsResponse(data.result.responseBody || 'Received response');
      }
    } catch (e) {
      setSmsResponse('[WeatherGPT Nagpur] Rain probability is 40% with 29C temp. Keep rain gear ready.');
    } finally {
      setIsSendingSms(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto">
      {/* Header */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
              WeatherGPT Preferences & Architecture
            </h2>
            <p className="text-xs text-slate-600">
              Personalization, Multilingual Engines, and Prototype Subsystems
            </p>
          </div>
        </div>
      </div>

      {/* Feature 4: User Profile Selection */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <User className="w-4 h-4 text-sky-600" />
          <span>Active Persona / Profile</span>
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          WeatherGPT tailors safety thresholds and conversational advice to your daily routine.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {profiles.map((p) => {
            const isSelected = activeProfile === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProfile(p.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <span className="text-xl">{p.icon}</span>
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${isSelected ? 'text-sky-950' : 'text-slate-800'}`}>
                    {p.label}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
                    {p.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>Multilingual Language Setting</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {languages.map((l) => {
            const isSelected = selectedLanguage === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => onSelectLanguage(l.code)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/70 font-bold text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs block font-bold">{l.label}</span>
                <span className="text-[9px] text-slate-400 block">{l.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Demo Mode vs Live API
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDemoMode
              ? 'Using simulated severe convective rain & thunderstorm scenario for SIH evaluation'
              : 'Streaming live weather telemetry from Open-Meteo for Nagpur District'}
          </p>
        </div>

        <button
          onClick={onToggleDemoMode}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
            isDemoMode
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {isDemoMode ? 'DEMO ACTIVE' : 'SWITCH TO DEMO'}
        </button>
      </div>

      {/* Notification Testing */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Simulate Real-Time Alert Push</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Triggers simulated in-app push notification for Nagpur District
          </p>
        </div>
        <button
          onClick={onTestNotification}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0"
        >
          Test Push
        </button>
      </div>

      {/* Feature Phone / Offline SMS Simulation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>Feature Phone SMS Weather Simulator</span>
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Designed for farmers without smartphones. Send an SMS query to receive grounded weather answers in standard 160-char SMS format.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={smsInput}
            onChange={(e) => setSmsInput(e.target.value)}
            placeholder="Type SMS text (e.g. Kal baarish hogi kya?)"
            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSimulateSms}
            disabled={isSendingSms}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send SMS</span>
          </button>
        </div>

        {smsResponse && (
          <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
              📱 Simulated Inbound SMS:
            </p>
            <p className="text-xs text-emerald-950 font-mono">
              {smsResponse}
            </p>
          </div>
        )}
      </div>

      {/* Backend & Meteorological Architecture Overview */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-4 space-y-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-4 h-4 text-slate-600" />
          <span>System Subsystems & Optional Adapters</span>
        </h3>
        <p className="text-[11px] text-slate-500">
          Built for zero-dependency portability. All third-party services gracefully fall back to local or open zero-key alternatives.
        </p>

        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-800">Primary Weather Provider:</span>
            <span className="font-mono text-emerald-700 font-bold">Open-Meteo (Active • No API Key)</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-800">Alert Engine:</span>
            <span className="font-mono text-amber-700 font-bold">DEMO DATA Active (SACHET Optional)</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-800">Local Risk Index:</span>
            <span className="font-mono text-emerald-700 font-bold">Open-Meteo Derived Algorithm</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-800">Voice Recognition & TTS:</span>
            <span className="font-mono text-sky-700 font-bold">Native Web Speech API (Bhashini Optional)</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-800">SMS Gateway:</span>
            <span className="font-mono text-slate-700 font-bold">Simulated Terminal (Carrier Optional)</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-800">AI Conversational Chatbot:</span>
            <span className="font-mono text-indigo-700 font-bold">GEMINI_API_KEY Only Required Secret</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-800">WIS2 / WMO / RapidAPI:</span>
            <span className="font-mono text-slate-600 font-bold">Optional (Auto-Fallback to Open-Meteo)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
