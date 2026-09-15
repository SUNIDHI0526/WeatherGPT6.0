# WeatherGPT Python FastAPI Backend
### SIH 2026 Problem Statement 26068: WeatherGPT
**Location Focus:** Nagpur District, Maharashtra, India

This directory provides the companion Python FastAPI backend matching all endpoints specified in the SIH problem statement:
- `GET /weather/current` - Live Open-Meteo current telemetry for Nagpur
- `GET /weather/forecast` - Hourly & 7-day daily forecasts
- `GET /alerts` - Explain My Alert prototype feed
- `GET /risk` - Local Risk Index (0-100)
- `POST /chat` - Grounded Multilingual Chatbot
- `POST /route` - OSRM Corridor Weather (Nagpur to Kamptee)
- `GET /locations` - Nagpur sub-districts and corridors
- `POST /notifications/subscribe` - In-app push simulation

### Quickstart:
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
