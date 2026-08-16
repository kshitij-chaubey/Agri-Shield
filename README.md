# 🌾 AgriShield AI
### Climate-Resilient Agricultural Early-Warning & Multi-Channel IVR Dispatch Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet.js-199900.svg?style=flat&logo=leaflet)](https://leafletjs.com)
[![Gemini](https://img.shields.io/badge/AI%20Reasoning-Google%20Gemini-4285F4.svg?style=flat&logo=google)](https://ai.google.dev)
[![Twilio](https://img.shields.io/badge/Telephony-Twilio%20IVR%20%2B%20SMS-F22F46.svg?style=flat&logo=twilio)](https://www.twilio.com)

---

## 📌 Overview & Problem Statement
Extreme weather events—such as unseasonal heavy downpours, cyclonic gales, hailstorms, and riverine flood surges—cause devastating crop losses across regional agricultural belts. Low-literacy smallholder farmers often receive generalized weather forecasts without **stage-specific, actionable agricultural advice** (e.g. knowing whether to immediately dig perimeter trenches, stake tall horticultural crops, or harvest mature produce early).

**AgriShield AI** bridges this gap by integrating:
1. **Live Open-Meteo & Climate Hazard Simulation** across regional agro-climatic zones (Nashik, Ludhiana, Guntur, Puri, Thanjavur, Anand, Midnapore, Patna).
2. **Hyperlocal Geospatial Matching** of registered farm holdings, crops (Wheat, Cotton, Paddy, Onion & Grapes, Chilli, Mustard, Pulses), growth stages, and soil types.
3. **AI Agronomist Reasoning Engine** (Gemini 2.5 Flash / Domain Knowledge Matrix) generating exactly 3 concise, highly actionable field interventions.
4. **Multilingual Speech Synthesis** generating native **Hindi (हिंदी)**, **English**, and **Regional (Odia / etc.)** voice broadcasts.
5. **Multi-Channel Telephony Dispatcher** with Twilio SMS and automated Interactive Voice Response (**IVR Voice Calls**) featuring interactive keypad input (Press 1 to replay, Press 2 to report flood inundation).
6. **Zero-Dependency Sandbox Simulation**: Works 100% out of the box with built-in agronomist heuristics and mock telephony, while immediately supporting live Twilio & Gemini credentials.

---

## 🏛️ System Architecture

```
[ Open-Meteo Live API / Extreme Weather Simulation ]
                        │
                        ▼
       [ FastAPI Backend: Hazard Analysis Engine ]
                        │
 ┌──────────────────────┼──────────────────────┐
 │                      │                      │
 ▼                      ▼                      ▼
[ Hyperlocal Query ]   [ AI Agronomist ]    [ TTS Synthesis ]
• Agro-Climatic Zone   • Gemini 2.5 Flash   • Hindi (हिंदी) MP3
• Crop Growth Stage    • 3 Action Points    • English / Regional
• Soil & Vulnerability • Urgency Rating     • Public Audio Stream
 └──────────────────────┬──────────────────────┘
                        │
                        ▼
           [ Telephony Dispatcher ]
            ├─► SMS Messages API (Concise Localized Text)
            └─► IVR Calls API (TwiML Voice + DTMF Keypad 1 & 2)
                        │
                        ▼
[ Next.js Command Dashboard ] ◄── Real-Time Telemetry & Leaflet GIS
```

---

## ✨ Key Features

- 🗺️ **Pan-Regional Farmland GIS Map:** Leaflet.js visualization covering major agricultural regions across India with dynamic hazard zones and geo-mapped farm pins.
- ⚡ **Disaster Simulation Control Bar:** Quick presets (*Unseasonal Rains in Nashik*, *Inundation in Ludhiana*, *Super Cyclone Landfall*, *Gale Storm in Guntur*, *Monsoon Flood in Patna*) + custom wind & rain sliders.
- 🌾 **Hyperlocal Agronomist Reasoning:** Tailored advice based on exact crop growth stage (Harvest-Ready, Flowering, Tillering, Seedling, Vegetative) and soil mechanics.
- 🎙️ **Voice Broadcast Player:** Audio waveform visualizer allowing users to stream and download the exact generated MP3 voice broadcast in Hindi, English, and Odia.
- 📱 **Interactive On-Screen Phone Handset Simulator:** Allows testing the automated emergency call directly in the browser with dialpad keys **`1`** (Replay) and **`2`** (Report Damage).
- 👥 **Farmer Registry & Live Onboarding:** Pre-seeded with 8 diverse regional farmers, with the ability to add real phone numbers (`+91...`) for live SMS and Twilio voice calls.
- 📊 **Real-Time Telephony Stream:** Live 5-step pipeline tracking every alert from trigger to SMS delivery and IVR call completion.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.10+** (Tested on Python 3.14)
- **Node.js 18+** & **npm**

### Step 1: Launch Backend (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
> Backend API will be available at **`http://127.0.0.1:8000`** (Swagger docs at `/docs`).

---

### Step 2: Launch Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
> Frontend Dashboard will be available at **`http://localhost:3000`**.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend health & telephony mode status |
| `GET` | `/api/farmers` | List registered regional farmers |
| `POST` | `/api/farmers` | Onboard new farmer / Test phone number |
| `GET` | `/api/weather/districts` | Regional agricultural zones & hazard profiles |
| `GET` | `/api/weather/current/{district}` | Live Open-Meteo weather for region |
| `POST` | `/api/weather/simulate` | Trigger climate hazard disaster simulation |
| `POST` | `/api/advisory/generate` | Generate stage-specific AI crop advisory + audio |
| `GET` | `/api/audio/stream/{filename}` | Stream synthesized MP3 audio broadcast |
| `POST` | `/api/alerts/dispatch` | Send SMS & automated IVR phone call |
| `GET` | `/api/alerts/live` | Real-time dispatch telemetry and interaction stream |
| `POST` | `/api/twilio/voice-webhook` | Twilio TwiML programmable voice handler |
| `POST` | `/api/twilio/ivr-input` | Process farmer DTMF keypress (1: Replay, 2: Report Damage) |
| `GET` | `/api/stats` | Dashboard KPI summary |

---

## 🛡️ License
Distributed under the MIT License.