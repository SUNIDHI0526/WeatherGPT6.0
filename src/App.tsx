import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { WelcomeModal } from './components/WelcomeModal';
import { VoiceModal } from './components/VoiceModal';
import { NotificationToast } from './components/NotificationToast';

import { HomeScreen } from './components/screens/HomeScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { AlertsScreen } from './components/screens/AlertsScreen';
import { LocationsScreen } from './components/screens/LocationsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

import {
  WeatherData,
  LocalRiskIndex,
  AlertData,
  ChatMessage,
  UserProfileType,
  LanguageCode,
  RouteWeather
} from './types/weather';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [activeProfile, setActiveProfile] = useState<UserProfileType>('general');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [riskIndex, setRiskIndex] = useState<LocalRiskIndex | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  const [notification, setNotification] = useState<{
    id: string;
    title: string;
    body: string;
    type?: 'alert' | 'weather' | 'sms';
  } | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: '👋 Namaste! I am WeatherGPT, your conversational weather companion for Nagpur District, Maharashtra.\n\nYou can ask me natural questions like:\n• "Will it rain tomorrow?"\n• "Kal Nagpur mein baarish hogi kya?"\n• "उद्या पाऊस पडेल का?"\n• "Is it safe to travel from Nagpur to Kamptee at 6 PM?"',
      timestamp: new Date().toISOString(),
      detectedLanguage: 'en',
      sources: ['Open-Meteo High-Resolution Model', 'Nagpur Station Telemetry']
    }
  ]);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Check first launch
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('weathergpt_welcome_completed');
    if (!hasSeenWelcome) {
      setIsWelcomeOpen(true);
    }
  }, []);

  // Fetch initial telemetry
  const fetchTelemetry = async (demo = isDemoMode) => {
    setIsLoadingWeather(true);
    try {
      // Current weather & forecast
      const weatherRes = await fetch(`/api/weather/forecast?location=nagpur&demo=${demo}`);
      const weatherJson = await weatherRes.json();
      if (weatherJson.success) {
        setWeatherData(weatherJson);
      }

      // Local Risk Index
      const riskRes = await fetch(`/api/risk?location=nagpur&demo=${demo}`);
      const riskJson = await riskRes.json();
      if (riskJson.success) {
        setRiskIndex(riskJson.risk);
      }

      // Alerts feed
      const alertsRes = await fetch('/api/alerts?district=Nagpur');
      const alertsJson = await alertsRes.json();
      if (alertsJson.success && alertsJson.alerts) {
        setAlerts(alertsJson.alerts);
      }
    } catch (err) {
      console.warn('Backend API connection warning, using fallback telemetry:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchTelemetry(isDemoMode);
  }, [isDemoMode]);

  // Handle Welcome complete
  const handleWelcomeComplete = (mode: 'voice' | 'text', lang: LanguageCode) => {
    localStorage.setItem('weathergpt_welcome_completed', 'true');
    setSelectedLanguage(lang);
    setIsWelcomeOpen(false);
    if (mode === 'voice') {
      setActiveTab('chat');
      setIsVoiceModalOpen(true);
    } else {
      setActiveTab('chat');
    }
  };

  // Chat message submission
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          location: 'nagpur',
          profile: activeProfile,
          demo: isDemoMode
        })
      });

      const data = await res.json();
      if (data.success) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.response,
          timestamp: data.timestamp || new Date().toISOString(),
          detectedLanguage: data.detectedLanguage,
          sources: data.sources,
          cards: data.cards
        };
        setMessages((prev) => [...prev, botMsg]);

        // Auto speak if sound toggle is enabled
        if (soundEnabled && ('speechSynthesis' in window)) {
          window.speechSynthesis.cancel();
          const clean = data.response.replace(/[#*_`]/g, '');
          const utterance = new SpeechSynthesisUtterance(clean);
          if (data.detectedLanguage === 'hi' || data.detectedLanguage === 'hinglish') utterance.lang = 'hi-IN';
          else if (data.detectedLanguage === 'mr' || data.detectedLanguage === 'mr-latin') utterance.lang = 'mr-IN';
          else utterance.lang = 'en-IN';
          window.speechSynthesis.speak(utterance);
        }
      } else {
        throw new Error(data.error || 'Unable to generate grounded response');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: '⚠️ I had a temporary issue reaching the live meteorological server. Please verify your connection or switch to Demo Mode in Settings.',
        timestamp: new Date().toISOString(),
        sources: ['WeatherGPT System Fail-Safe']
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Route calculation
  const handleComputeRoute = async (from: string, to: string): Promise<RouteWeather> => {
    const res = await fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to })
    });
    const json = await res.json();
    return json.route;
  };

  // Quick prompt redirection from screens to chat
  const handleNavigateToChat = (initialPrompt?: string) => {
    setActiveTab('chat');
    if (initialPrompt) {
      setTimeout(() => {
        handleSendMessage(initialPrompt);
      }, 100);
    }
  };

  // Simulate Push Notification
  const handleSimulateAlertNotification = (alert: AlertData) => {
    setNotification({
      id: alert.id,
      title: alert.title,
      body: `Weather warning active in ${alert.where}. ${alert.whatCouldHappen}`,
      type: 'alert'
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased selection:bg-sky-100 selection:text-sky-900">
      {/* Fixed Sticky Header */}
      <Header
        locationName="Nagpur District, Maharashtra"
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenAlerts={() => setActiveTab('alerts')}
        hasActiveAlerts={alerts.length > 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-3 pb-20">
        {activeTab === 'home' && (
          <HomeScreen
            weatherData={weatherData}
            riskIndex={riskIndex}
            activeAlert={alerts[0] || null}
            isLoading={isLoadingWeather}
            onRefresh={() => fetchTelemetry(isDemoMode)}
            onNavigateToChat={handleNavigateToChat}
            onNavigateToAlerts={() => setActiveTab('alerts')}
            onNavigateToCorridor={() => setActiveTab('locations')}
          />
        )}

        {activeTab === 'chat' && (
          <ChatScreen
            messages={messages}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            activeProfile={activeProfile}
            selectedLanguage={selectedLanguage}
            onClearHistory={() => setMessages([messages[0]])}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsScreen
            alerts={alerts}
            onAskChatToExplain={(prompt) => handleNavigateToChat(prompt)}
            onSimulateNotification={handleSimulateAlertNotification}
          />
        )}

        {activeTab === 'locations' && (
          <LocationsScreen
            onComputeRoute={handleComputeRoute}
            onAskChatAboutRoute={(from, to) =>
              handleNavigateToChat(`Is it safe to travel from ${from} to ${to} right now?`)
            }
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            activeProfile={activeProfile}
            onSelectProfile={setActiveProfile}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            isDemoMode={isDemoMode}
            onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
            onTestNotification={() =>
              setNotification({
                id: 'test-push',
                title: 'Nagpur Weather Warning Test',
                body: 'Sudden rain shower alert active near Kamptee Road & Wardha Road. Local Risk: 62 (HIGH).',
                type: 'weather'
              })
            }
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadAlertCount={alerts.length}
      />

      {/* Voice Recognition Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendTranscript={(transcript) => {
          handleSendMessage(transcript);
        }}
        selectedLanguage={selectedLanguage}
      />

      {/* First Launch Onboarding Experience */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onComplete={handleWelcomeComplete}
      />

      {/* Push Notification Toast Simulation */}
      <NotificationToast
        notification={notification}
        onDismiss={() => setNotification(null)}
        onAction={() => {
          setNotification(null);
          setActiveTab('alerts');
        }}
      />
    </div>
  );
}
