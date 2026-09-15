import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, AlertCircle, Sparkles } from 'lucide-react';
import { LanguageCode } from '../types/weather';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTranscript: (transcript: string) => void;
  selectedLanguage: LanguageCode;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onSendTranscript,
  selectedLanguage
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setError(null);
      return;
    }

    // Auto-start recognition when opened
    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const getLanguageTag = (lang: LanguageCode): string => {
    switch (lang) {
      case 'hi':
      case 'hinglish':
        return 'hi-IN';
      case 'mr':
      case 'mr-latin':
        return 'mr-IN';
      default:
        return 'en-IN';
    }
  };

  let recognitionInstance: any = null;

  const startListening = () => {
    setError(null);
    setTranscript('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Web Speech API is not supported in this browser. You can type in English, Hindi, or Marathi directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getLanguageTag(selectedLanguage);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone permission to speak with WeatherGPT.');
        } else if (event.error !== 'no-speech') {
          setError(`Speech input error (${event.error}). Please try speaking again.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionInstance = recognition;
    } catch (err: any) {
      setError('Unable to activate speech recognition. Please check microphone permissions.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleConfirm = () => {
    if (transcript.trim()) {
      onSendTranscript(transcript.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-slate-800 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              WeatherGPT Voice Input
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Visualizer / Pulse circle */}
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <div className="relative">
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-sky-400/20 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-indigo-400/10 animate-pulse" />
              </>
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all relative z-10 shadow-lg ${
                isListening
                  ? 'bg-rose-500 text-white shadow-rose-500/30 ring-8 ring-rose-100'
                  : 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-sky-500/25'
              }`}
            >
              {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </button>
          </div>

          <p className="text-xs font-semibold text-slate-700 mt-4">
            {isListening ? 'Listening in Nagpur... Speak your question now' : 'Tap the microphone to speak'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Supported: English • हिंदी • Hinglish • मराठी
          </p>
        </div>

        {/* Live Transcript Display */}
        <div className="min-h-[70px] bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex items-center justify-center text-center">
          {transcript ? (
            <p className="text-sm font-medium text-slate-800">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Example: "Kal Nagpur mein baarish hogi kya?" or "Will it rain tomorrow?"
            </p>
          )}
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!transcript.trim()}
            onClick={handleConfirm}
            className="flex-2 py-3 rounded-xl bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask WeatherGPT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
