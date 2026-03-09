# 🌾 Krishi Saathi — AI-Powered Farming Assistant

> Every farmer deserves a saathi.

Krishi Saathi is an offline-first AI farming assistant built for small and marginal farmers in rural India. It provides crop disease detection, market price intelligence, and personalized farming advice — in 8 Indian languages, even without internet.

**Live Demo:** https://krishi-saathi-ochre.vercel.app

---

## The Problem

- 146 million farmers in India, 86% are small and marginal
- Crop losses of 15-30% annually due to delayed disease identification
- Income loss of 20-40% due to market price manipulation by middlemen
- No agricultural expert accessible in rural areas
- Most agri-tech apps require internet and high-end phones

## Our Solution

Krishi Saathi puts an AI agricultural expert in every farmer's pocket — working in their language, on their low-end phone, with or without internet.

---

## Features

### Scan Crop — Disease Detection
- Upload or capture a photo of an affected crop leaf
- AI identifies disease, confidence level, and severity in under 3 seconds
- Provides organic treatment, chemical treatment, and prevention advice
- Works offline using on-device TFLite model
- Powered by Plant.id API + Amazon Bedrock

### Mandi Voice — Market Price Calculator
- Speak or type crop name and quantity
- AI compares local mandi price vs Government MSP vs nearby states
- Calculates exact earnings and recommends best selling location
- Hindi voice readout of results
- Offline fallback with cached price data
- Powered by Amazon Bedrock (amazon.nova-lite-v1:0)

### Crop Diary — Farm Journal
- Record daily farming activities via voice or text
- AI analyzes entries and provides personalized advice
- History grouped by date
- Works fully offline with rule-based advice
- Powered by Groq LLaMA 3.3 70B

### AI Sahayak — Farming Assistant
- 24/7 conversational AI farming expert
- Automatically responds in the farmer's language
- Maintains full conversation history
- Offline suggestion cards for common queries
- Powered by Amazon Bedrock

### Pest Early Warning (Beta)
- Community-reported pest alerts on interactive map
- Zone-based severity indicators (Critical/Moderate/Safe)
- Real OpenStreetMap integration via Leaflet.js
- Report pest sightings to help the community

### Lunar Planting Calendar (Beta)
- AI-enhanced lunar phase planting recommendations
- Current moon phase with crop-specific advice
- Upcoming favorable days for sowing, harvesting, fertilizing
- Combines traditional Vedic wisdom with modern AI

---

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Leaflet.js + OpenStreetMap

### Backend
- Node.js + Express.js
- SQLite3
- REST API

### AI & Machine Learning
- Amazon Bedrock (amazon.nova-lite-v1:0)
- Groq LLaMA 3.3 70B
- Plant.id API v3
- TensorFlow Lite (offline)
- Web Speech API

### Infrastructure
- Vercel (Frontend)
- Render (Backend)
- GitHub (CI/CD)

---

## Architecture
```
Farmer's Phone (Browser)
        ↓
React Frontend (Vercel)
        ↓
Node.js Backend (Render)
        ↓
┌───────────────────────────┐
│  Amazon Bedrock           │ ← Mandi Voice, Scan Crop, Sahayak
│  Groq LLaMA 3.3           │ ← Crop Diary
│  Plant.id API             │ ← Disease Detection
│  SQLite3                  │ ← Diary Storage
└───────────────────────────┘

Offline Mode:
        ↓
TFLite On-Device Model     ← Disease Detection
Cached Market Data         ← Mandi Prices
Rule-Based Engine          ← AI Advice
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/PiyushJha-25/krishi-saathi.git
cd "krishi saathi web app"
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd krishi-backend
npm install
```

4. Create environment file:
```bash
cd krishi-backend
cp .env.example .env
```

5. Add your API keys to `.env`:
```
GROQ_API_KEY=your_groq_key
AWS_BEDROCK_API_KEY=your_aws_access_key
AWS_BEDROCK_SECRET_KEY=your_aws_secret_key
AWS_BEDROCK_REGION=us-east-1
PLANT_ID_API_KEY=your_plant_id_key
```

### Running Locally

Start backend:
```bash
cd krishi-backend
node index.js
```

Start frontend (new terminal):
```bash
cd "krishi saathi web app"
npm run dev
```

Open http://localhost:5173

---

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| GROQ_API_KEY | Groq API key for LLaMA model |
| AWS_BEDROCK_API_KEY | AWS IAM Access Key ID |
| AWS_BEDROCK_SECRET_KEY | AWS IAM Secret Access Key |
| AWS_BEDROCK_REGION | AWS region (us-east-1) |
| PLANT_ID_API_KEY | Plant.id API key |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| VITE_API_BASE_URL | Backend URL (default: http://localhost:5000) |

---

## Deployment

### Frontend — Vercel
- Connect GitHub repo to Vercel
- Root directory: `krishi saathi web app`
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_BASE_URL` environment variable

### Backend — Render
- Connect GitHub repo to Render
- Root directory: `krishi saathi web app/krishi-backend`
- Build command: `npm install`
- Start command: `node index.js`
- Add all backend environment variables

---

## Language Support

| Language | Code |
|----------|------|
| English | en |
| Hindi | hi |
| Telugu | te |
| Kannada | kn |
| Tamil | ta |
| Marathi | mr |
| Bengali | bn |
| Punjabi | pa |

---

## Offline Capabilities

| Feature | Online | Offline |
|---------|--------|---------|
| Disease Detection | Plant.id + Bedrock | TFLite on-device |
| Market Prices | Live Bedrock analysis | Cached MSP data |
| Crop Diary | Groq AI advice | Rule-based advice |
| AI Sahayak | Full Bedrock chat | Suggestion cards |
| All UI | Full | Full |

---

## Team

**Code Dynamos**


---

*Krishi Saathi — Empowering farmers with AI, one harvest at a time.*