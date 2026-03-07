# PolitiSense — Political Intelligence Dashboard

A modern AI-powered political intelligence dashboard. Generate daily briefings, monitor sentiment, send reports, and manage contacts.

## Quick Start

**Prerequisites:** Node.js v18+

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your Gemini API Key
Create a `.env.local` file in the project root:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 3. Run the app
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Features

- **Dashboard** — Scope selector (Nationwide / State-wise), sentiment summary, performance ratings
- **Top News** — Clickable Positive / Neutral / Negative news tabs
- **Generated Brief** — AI-generated briefing, fully editable with Save/Cancel, copyable
- **Send Center** — WhatsApp, Email, Telegram previews with recipient selection
- **Contact Import** — CSV/XLSX import with auto column mapping and deduplication
- **Mock Mode** — Runs without API key for UI testing

---

## Contact Import Format

Upload `.csv` or `.xlsx` files. Supported column headers (auto-detected):

| Field     | Aliases accepted                          |
|-----------|-------------------------------------------|
| name      | name, fullname, contactname, person       |
| role      | role, designation, position, title, job   |
| whatsapp  | whatsapp, phone, mobile, wa, contact      |
| email     | email, emailaddress, mail, emailid        |
| telegram  | telegram, telegramid, tg                  |

Example CSV:
```
name,role,whatsapp,email,telegram
Amit Shah,Home Minister,+919876543211,amit@bjp.org,@amitshah
```

Deduplication priority: **WhatsApp > Email > Telegram**

---

## Architecture Notes

- **Send is simulated** (MVP). To integrate n8n or webhooks, replace the `sendMessage()` function in `src/services/geminiService.ts`:
  ```ts
  export async function sendMessage(payload) {
    return await fetch('https://abhimishraworkfloww.app.n8n.cloud/webhook/generateBrief', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
  ```

- **Live Data**: Toggle "Live Data" in settings and connect your real data API in `src/services/geminiService.ts → generateBriefing()`

---

## Tech Stack

- Vite + React + TypeScript
- TailwindCSS v4
- Framer Motion
- @google/genai (Gemini 2.0 Flash)
- react-markdown
- xlsx (CSV/XLSX parsing)
- lucide-react
