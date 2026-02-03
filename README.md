<div align="center">

# FinTrack

### Smart Personal Finance Tracker for Telegram

<img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
<img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/Telegram-Mini_App-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" />
<img src="https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />

---

**FinTrack** is a modern personal finance management app designed as a Telegram Mini App.
Track expenses, manage subscriptions, convert currencies, and get AI-powered financial advice.

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Telegram Setup](#telegram-setup) • [Environment Variables](#environment-variables)

</div>

---

## Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Beautiful overview with animated balance, income/expense charts, and monthly statistics |
| **Transactions** | Track income and expenses with categories and date filtering |
| **Subscriptions** | Manage recurring payments with reminder notifications |
| **Currency Converter** | Real-time conversion between USD, PLN, RUB, UAH |
| **AI Financial Advisor** | Get personalized financial advice powered by Google Gemini |
| **Wishlist** | Track your savings goals and wishes |
| **Push Notifications** | Telegram reminders for upcoming subscription payments |
| **Multi-language** | Support for Russian, English, and Polish |

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Build Tool:** Vite 6
- **Charts:** Recharts
- **AI:** Google Gemini API
- **Deployment:** Vercel (with serverless API routes)
- **Platform:** Telegram Mini App SDK

---

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/Zulut30/finance-book-.git
cd finance-book-

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI advisor |
| `VITE_OPENEXCHANGERATES_APP_ID` | Optional | [Open Exchange Rates](https://openexchangerates.org) API key for live currency rates |
| `TELEGRAM_BOT_TOKEN` | For Push | Telegram bot token from @BotFather |
| `CRON_SECRET` | For Push | Secret key for Vercel cron authentication |
| `KV_REST_API_URL` | For Push | Upstash Redis URL for persistent storage |
| `KV_REST_API_TOKEN` | For Push | Upstash Redis token |

> **Note:** The app works without API keys using demo data and fallback rates.

---

## Telegram Setup

To run FinTrack as a Telegram Mini App:

### 1. Create a Telegram Bot

1. Open [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the instructions
3. Save the bot token

### 2. Deploy to HTTPS

Telegram requires HTTPS. Deploy options:

- **Vercel** (recommended): Connect your GitHub repo at [vercel.com](https://vercel.com)
- **Netlify**, **GitHub Pages**, or any HTTPS hosting

```bash
# Build for production
npm run build
# Deploy the `dist` folder
```

### 3. Configure Mini App

1. In [@BotFather](https://t.me/BotFather): `/myapps` → Select your bot
2. Go to **Bot Settings** → **Menu Button**
3. Set your deployed URL (e.g., `https://your-app.vercel.app`)

### 4. Open the App

- Click the menu button in your bot's chat, or
- Navigate to `https://t.me/YourBotName/app`

---

## Push Notifications

FinTrack can send Telegram reminders for upcoming subscription payments.

### How It Works

1. **Sync:** When opened in Telegram, subscriptions sync to the server via `/api/sync`
2. **Cron Job:** Daily at 09:00 UTC, `/api/cron/remind` checks for upcoming payments
3. **Notify:** Users with subscriptions due in 0-3 days receive a Telegram message

### Setup

1. Deploy to **Vercel** (required for API routes and cron)
2. Set environment variables in Vercel dashboard:
   - `TELEGRAM_BOT_TOKEN`
   - `CRON_SECRET`
   - (Optional) Upstash Redis credentials for persistent storage
3. Enable "Notify 3 days before" for subscriptions in the app

---

## Project Structure

```
FinTrack/
├── api/                    # Vercel serverless functions
│   ├── sync.ts            # Subscription sync endpoint
│   └── cron/
│       └── remind.ts      # Daily notification cron
├── components/             # React components
│   ├── Dashboard.tsx      # Main dashboard with charts
│   ├── TransactionList.tsx
│   ├── SubscriptionList.tsx
│   ├── AiAdvisor.tsx      # Gemini AI integration
│   ├── Converter.tsx      # Currency converter
│   └── Wishlist.tsx
├── context/               # React contexts
│   ├── LanguageContext.tsx
│   └── ExchangeRatesContext.tsx
├── services/              # API services
│   └── geminiService.ts
├── utils/                 # Utility functions
│   └── telegram.ts        # Telegram WebApp helpers
├── App.tsx                # Main application
├── types.ts               # TypeScript definitions
└── index.html
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with React + Telegram Mini Apps**

</div>
