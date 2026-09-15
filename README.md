# WeatherGPT 🌦️

### SIH 2026 — Problem Statement 26068
**Conversational AI for Weather Forecasting, Alerts, and Climate Information**

WeatherGPT is a mobile-first conversational weather companion designed initially for **Nagpur District, Maharashtra, India**. Instead of presenting weather as a traditional dashboard, it lets users ask natural-language questions about weather, rainfall, alerts, travel conditions, and safety.

The prototype is designed to work **without API keys or paid credentials**.

---

## ✨ Key Features

### 🌤️ Live Weather
- Real-time weather data from Open-Meteo
- Temperature and feels-like temperature
- Humidity
- Rain probability
- Wind speed and gusts
- Cloud cover
- Hourly and daily forecasts
- Weather condition indicators

### 💬 Conversational Weather Assistant
Users can ask natural-language questions such as:

- "What is the weather in Nagpur?"
- "Will it rain today?"
- "Will it rain at 6 PM?"
- "Should I carry an umbrella?"
- "How hot will it be tomorrow?"
- "Is it safe to travel?"
- "Explain my alert"

The application uses a local intent and response engine, so the chatbot does not require a paid LLM API.

### ⚠️ Explain My Alert
A core innovation of WeatherGPT.

Instead of simply displaying an alert, WeatherGPT explains:

- What is happening
- Why it matters
- Who may be affected
- What could happen locally
- What users should do
- What users should avoid
- When extra caution may be required

Demo alerts are clearly marked as **DEMO DATA** and are never presented as official government warnings.

### 📊 Local Risk Index
A prototype decision-support score from **0–100**, calculated using available weather conditions such as:

- Rain probability
- Precipitation
- Wind speed
- Wind gusts
- Thunderstorm-related weather codes
- Cloud cover
- Temperature extremes

Risk levels:

| Score | Risk |
|---|---|
| 0–20 | Low |
| 21–40 | Moderate |
| 41–60 | Elevated |
| 61–80 | High |
| 81–100 | Severe |

> **Important:** The Local Risk Index is prototype/AI-derived decision support and is **not an official warning**.

### 🛣️ Route Corridor Weather
Users can enter a journey such as:

**Nagpur → Wardha**

Weather conditions are analyzed at sampled points along the route.

The feature can show:

- Route weather
- Rain probability
- Temperature
- Wind
- Risk
- Highest-risk segment
- Suggested departure window

### 🗣️ Voice Support
Uses browser/device-native speech capabilities:

- Speech recognition
- Speech synthesis
- English
- Hindi
- Marathi

No Bhashini API key is required.

If voice support is unavailable in the browser, the application gracefully falls back to text input.

### 🌐 Multilingual Interaction

Supports:

- English
- Hindi
- Hinglish
- Marathi
- Roman-script Hinglish/Marathi

Examples:

```text
क्या आज बारिश होगी?
आज पाऊस पडेल का?
Aaj baarish hogi kya?
