ПРОИЗОШЛА ОШИБКА ПРИ ЗАПОЛНЕНИИ ФОРМЫ ПРОВЕРИТЬ ПРОЕКТ МОЖНО ПО ЖДАННОЙ ССЫЛКЕ https://sudoku-iss-9n62-ceuu128hv-issabek-s-projects.vercel.app/
# Brain Morning Sudoku

> Утреннее Судоку для подготовки мозга — startup-ready прототип с AI Coach, Daily Challenge и городским рейтингом.

**Стек:** Next.js 14 · TypeScript · Tailwind CSS · Zustand · Supabase · OpenAI · Stripe · Vercel

---

## Содержание

- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [Настройка Supabase](#настройка-supabase)
- [Настройка Stripe](#настройка-stripe)
- [Настройка OpenAI](#настройка-openai)
- [Управление в игре](#управление-в-игре)
- [Архитектура](#архитектура)
- [Деплой на Vercel](#деплой-на-vercel)
- [Что реализовано](#что-реализовано)
- [Монетизация](#монетизация)
- [Future Features](#future-features)

---

## Быстрый старт

### Требования

- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **npm** 9+ (идёт в комплекте с Node.js)
- Аккаунт [Supabase](https://supabase.com) (бесплатный тир подходит)

### 1. Клонировать репозиторий

```bash
git clone https://github.com/your-name/brain-morning-sudoku.git
cd brain-morning-sudoku
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Создать файл окружения

```bash
cp .env.local.example .env.local
```

Откройте `.env.local` и заполните переменные — минимально нужны только `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` (см. [Настройка Supabase](#настройка-supabase)).

### 4. Запустить dev-сервер

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

> **Без Supabase** игра полностью работает офлайн: генерация головоломок, таймер, notes, hints — всё сохраняется в `localStorage`. Аутентификация, лидерборд и AI Coach потребуют заполненных переменных окружения.

### Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер на порту 3000 с hot reload |
| `npm run build` | Сборка продакшн-бандла |
| `npm run start` | Запуск собранного приложения |
| `npm run lint` | ESLint проверка |
| `npm run typecheck` | Проверка типов TypeScript без сборки |

---

## Переменные окружения

Все переменные хранятся в `.env.local` (не коммитится в git).

```bash
# ─── Supabase (обязательно) ───────────────────────────────────────────────────
# URL проекта: Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co

# Публичный anon key: Settings → API → Project API keys → anon / public
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (только сервер): Settings → API → service_role
# Нужен для admin-операций (daily challenge upsert). Без него ежедневный challenge
# работает без записи в БД, остальное не ломается.
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─── OpenAI (опционально) ────────────────────────────────────────────────────
# Нужен для AI Coach. Без него кнопка "Спросить AI-тренера" вернёт подсказку
# с просьбой добавить ключ. platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# ─── Stripe (опционально) ────────────────────────────────────────────────────
# Нужен для Pro-подписки. Без него кнопка Upgrade to Pro вернёт ошибку.
# dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...

# ID цен из Stripe Dashboard → Products
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...

# Секрет для проверки webhook: dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# ─── App URL ─────────────────────────────────────────────────────────────────
# Локально: http://localhost:3000
# На Vercel: https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Настройка Supabase

### 1. Создать проект

1. Зайдите на [supabase.com](https://supabase.com) и создайте новый проект.
2. Подождите ~2 минуты пока поднимается база.

### 2. Применить схему базы данных

1. Откройте **SQL Editor** в левом меню.
2. Нажмите **New query**.
3. Вставьте содержимое файла `supabase/schema.sql` и нажмите **Run**.

Схема создаст:

| Таблица | Назначение |
|---------|-----------|
| `users` | Профили пользователей (имя, город, аватар) |
| `daily_challenges` | Ежедневные головоломки (seed по дате) |
| `solutions` | История решений (время, точность, сложность) |
| `leaderboards` | Рейтинг пользователей (суммарные очки) |
| `subscriptions` | Статус Pro-подписки через Stripe |
| `game_sessions` | Сохранённые сессии игры |
| `leaderboards_view` | Вью с рангами для запросов |

Также создаётся триггер `handle_new_user` — автоматически добавляет строки в `users`, `leaderboards` и `subscriptions` при регистрации.

### 3. Включить Email Auth

1. **Authentication → Providers → Email** → включить.
2. Опционально: отключить "Confirm email" для быстрого тестирования.

### 4. Настроить Google OAuth (опционально)

1. **Authentication → Providers → Google** → включить.
2. Создайте OAuth-приложение в [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
3. Добавьте `https://<your-project>.supabase.co/auth/v1/callback` в Authorized redirect URIs.
4. Вставьте Client ID и Client Secret в Supabase.

### 5. Скопировать ключи

**Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon / public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

---

## Настройка Stripe

> Stripe нужен только если хотите тестировать Pro-подписку. Игра работает без него.

### 1. Создать продукты

1. [Stripe Dashboard](https://dashboard.stripe.com) → **Products → Add product**.
2. Создайте продукт «Brain Morning Pro».
3. Добавьте две цены:
   - **Monthly** — Recurring, $4.99/month
   - **Yearly** — Recurring, $49.99/year
4. Скопируйте Price ID каждой цены в `.env.local`.

### 2. Настроить webhook (для локальной разработки)

Установите [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

CLI выведет `webhook signing secret` — вставьте его в `STRIPE_WEBHOOK_SECRET`.

### 3. Webhook на проде

В Dashboard → **Webhooks → Add endpoint**:
- URL: `https://your-domain.vercel.app/api/stripe/webhook`
- События: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## Настройка OpenAI

> AI Coach работает только для Pro-пользователей (с активной подпиской).

1. Получите API key на [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Добавьте в `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-...
   ```
3. Используется модель `gpt-4o-mini` — быстрая и дешёвая (~$0.00015 за запрос).

---

## Управление в игре

### Мышь / тач
- Клик по ячейке — выбрать её.
- Клик по кнопкам `1–9` внизу — ввести число.
- **Clear** — очистить ячейку.
- **Notes OFF/ON** — переключить режим заметок (pencil mode).
- **Подсказка** — заполнить выбранную ячейку правильным числом.

### Клавиатура (десктоп)
| Клавиша | Действие |
|---------|----------|
| `1` – `9` | Ввести цифру в выбранную ячейку |
| `Backspace` / `Delete` | Очистить ячейку |
| `←` `→` `↑` `↓` | Перемещаться по сетке |

---

## Архитектура

```
app/
├── page.tsx              — Главная: игровая доска + AI Coach
├── daily/page.tsx        — Daily Challenge
├── leaderboard/page.tsx  — Глобальный рейтинг + Топ Алматы
├── profile/page.tsx      — Профиль, авторизация, подписка
└── api/
    ├── daily-challenge/  — GET: генерация/upsert ежедневной головоломки
    ├── coach/            — POST: запрос к OpenAI (только Pro)
    └── stripe/
        ├── create-checkout-session/  — POST: создать Stripe Checkout
        └── webhook/                  — POST: обработка событий Stripe

components/               — UI-компоненты (SudokuGrid, Timer, AICoach…)
lib/
├── sudokuGenerator.ts    — Backtracking генератор + seeded random
├── sudokuSolver.ts       — Валидация, решатель, проверка конфликтов
├── gameResults.ts        — Подсчёт очков, запись в Supabase
├── zustand/store.ts      — Весь игровой стейт (Zustand)
├── supabase.ts           — Supabase client (браузер)
└── supabaseAdmin.ts      — Supabase admin client (сервер)

hooks/
└── useLocalStorageSync.ts — Автосохранение состояния игры в localStorage
```

### Поток данных

```
Пользователь → SudokuGrid (клик / клавиатура)
    → useGameStore (Zustand)
        → sudokuSolver (валидация конфликтов)
        → localStorage (автосохранение через useLocalStorageSync)
        → Supabase (submitCompletion при завершении)
            → leaderboards (обновление очков)
```

---

## Деплой на Vercel

1. Загрузите репозиторий на GitHub.
2. Зайдите на [vercel.com](https://vercel.com) → **Add New Project** → импортируйте репо.
3. В разделе **Environment Variables** добавьте все переменные из `.env.local`.
4. Нажмите **Deploy**.
5. После деплоя:
   - В Supabase **Authentication → URL Configuration** добавьте ваш Vercel URL в **Redirect URLs**: `https://your-domain.vercel.app/**`
   - В Stripe добавьте webhook endpoint (см. [выше](#3-webhook-на-проде)).
   - Обновите `NEXT_PUBLIC_APP_URL` на `https://your-domain.vercel.app`.

---

## Что реализовано

### Уровень 1 — фундамент UI
- Сетка 9×9 с блоками 3×3.
- Ввод чисел мышью и клавиатурой (1–9, стрелки, Delete).
- Mobile-first адаптивная вёрстка.

### Уровень 2 — базовая логика
- Валидация правил Судоку в реальном времени (строки, столбцы, блоки).
- Подсветка конфликтующих ячеек.
- Кнопка «Проверить решение».
- Таймер-секундомер (останавливается при завершении).
- Сложности: Easy, Medium, Hard, Expert.
- Офлайн-сохранение в `localStorage`.

### Уровень 3 — полноценный сервис
- Генератор уникальных головоломок: backtracking + проверка единственности решения.
- Notes / pencil mode (заметки в ячейках, очищаются при вводе числа).
- Hint system (заполняет выбранную ячейку; 3 подсказки бесплатно, безлимит — Pro).
- История ошибок с визуальным маркером ячейки.
- Supabase Auth: email/password и Google OAuth.
- Профиль: среднее время, точность, количество игр, суммарные очки.
- Тёмная/светлая тема (сохраняется между сессиями).

### Уровень 4 — вау-фичи
- **Daily Challenge** — одинаковый seed для всех на текущий день.
- **Глобальный лидерборд** + **Топ игроков из Алматы**.
- Система очков: учитывает время, точность, сложность, режим игры.
- **AI Coach** на `gpt-4o-mini`: объясняет стратегии кандидатов, скрытые пары, исключения (Pro-фича).
- **Upgrade to Pro** через Stripe Checkout.

---

## Монетизация

Модель: **freemium + Pro subscription**.

| | Free | Pro |
|--|------|-----|
| Все сложности | ✅ | ✅ |
| Daily Challenge | ✅ | ✅ |
| Лидерборд | ✅ | ✅ |
| Подсказки | 3 в игру | Безлимит |
| AI Coach | ❌ | ✅ |
| Кастомные скины | ❌ | ✅ |
| Расширенная аналитика | ❌ | ✅ |

**Цена:** $4.99/мес или $49.99/год.

---

## Future Features

- Multiplayer race — кто быстрее решит одно Судоку.
- Турниры по городам и компаниям.
- Mobile app на React Native.
- Push-уведомления для Morning Streak.
- AI-генерация персональных планов тренировок.
- Corporate wellness subscriptions.
- Realtime spectator mode на Supabase Realtime.

---

## Авторы

Автор: Full-Stack / Product / AI Engineer  
Контакты: your-email@example.com  
GitHub: https://github.com/your-name
