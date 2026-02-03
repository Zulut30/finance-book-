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

**Разработано командой Manacost** · Developed by Manacost team

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

### Проверка настроек после деплоя

После добавления переменных в Vercel **обязательно сделайте передеплой** (Deployments → ⋮ у последнего деплоя → Redeploy), иначе функции не увидят новые переменные.

Откройте в браузере: **`https://ваш-домен.vercel.app/api/status`**

- `telegramBot: "configured"` и `redis: "configured"` — всё настроено.
- `redis: "connection_failed"` — проверьте KV_REST_API_URL и KV_REST_API_TOKEN (скопируйте из панели Upstash заново), затем снова передеплойте.
- Для работы **/start** нужен ещё один шаг: [установить webhook](#5-webhook-команда-start-обязательно-для-приветствия).

---

## Testing

Unit and integration tests (Vitest):

```bash
npm test          # run tests once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

Tests cover:

- **services/currencyService** — конвертация валют, кэш, демо-курсы; тесты на скорость (10 000 вызовов `convertCurrency` / `convertToPLN` за &lt;500 ms).
- **api/lib/storage** — парсинг ключей, сохранение/чтение данных, лимит in-memory (до 5000 ключей); тест на скорость 100 операций set/get.
- **api/lib/telegram** — проверка `initData` (валидный хэш, истёкший/неверный `auth_date`, отсутствие `user`/`hash`).

Память и производительность:

- Кэш курсов валют: один объект, TTL 1 час, без неограниченного роста.
- In-memory хранилище (без Redis): не более 5000 ключей, при переполнении удаляются старые.
- Синхронизация с сервером: debounce 2 с, один запрос с полным набором данных.

Подробнее см. `docs/TESTING.md`.

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

### 5. Webhook: команда /start (обязательно для приветствия)

**Без этого шага бот не будет отвечать на /start.**

1. В Vercel в настройках проекта задайте переменную окружения `TELEGRAM_BOT_TOKEN` (токен от @BotFather).
2. После деплоя откройте в браузере (подставьте свой токен и URL):
   ```
   https://api.telegram.org/bot<ВАШ_TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<ваш-домен>.vercel.app/api/webhook
   ```
   Успешный ответ: `{"ok":true,"result":true,"description":"Webhook was set"}`.
3. Проверка: напишите боту в Telegram команду `/start` — должно прийти приветствие (RU/EN/PL по языку в настройках Telegram).

---

## Синхронизация между устройствами

**Чтобы синхронизация работала, нужны оба условия:**

1. Открывать приложение **из Telegram** (меню бота), а не по прямой ссылке в браузере.
2. **Настроить Upstash Redis** в Vercel: переменные `KV_REST_API_URL` и `KV_REST_API_TOKEN`. Без них данные на сервере не сохраняются между запросами (каждый запрос может попадать на другой экземпляр), поэтому на другом устройстве будет «пустой» аккаунт.

Как работает синхронизация:

- **При запуске**: запрос к `/api/data` по `initData`; если на сервере есть сохранённые данные (`updatedAt`), подгружаются транзакции, подписки и список желаний.
- **При изменениях**: через 2 с после изменений данные отправляются на сервер через `POST /api/sync`.

**Настройка Upstash Redis (бесплатный тариф):**

1. Зарегистрируйтесь на [upstash.com](https://upstash.com), создайте базу Redis.
2. В Vercel → Project → Settings → Environment Variables добавьте `KV_REST_API_URL` и `KV_REST_API_TOKEN` из панели Upstash.
3. Передеплойте проект.

---

## Push Notifications

FinTrack can send Telegram reminders for upcoming subscription payments.

### How It Works

1. **Sync:** When opened in Telegram, all data (transactions, subscriptions, wishes) syncs to the server via `/api/sync`; on load, data is fetched from `/api/data`.
2. **Cron Job:** Daily at 09:00 UTC, `/api/cron/remind` checks for upcoming payments
3. **Notify:** Users with subscriptions due in 0-3 days receive a Telegram message

### Setup

1. Deploy to **Vercel** (required for API routes and cron)
2. Set environment variables in Vercel dashboard:
   - `TELEGRAM_BOT_TOKEN` (required for webhook and cron)
   - `CRON_SECRET` (for cron authentication)
   - `KV_REST_API_URL` and `KV_REST_API_TOKEN` (Upstash Redis — **required for cross-device sync**; without them, data is not shared between devices)
3. Enable "Notify 3 days before" for subscriptions in the app

---

## Project Structure

```
FinTrack/
├── api/                    # Vercel serverless functions
│   ├── data.ts            # GET user data (sync across devices)
│   ├── sync.ts            # POST save transactions, subscriptions, wishes
│   ├── webhook.ts         # Telegram webhook: /start welcome message
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
