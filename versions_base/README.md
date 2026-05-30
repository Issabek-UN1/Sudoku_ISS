# Brain Morning Sudoku

Brain Morning Sudoku — веб-платформа для утренней тренировки мозга через Судоку. Проект создан как startup-ready прототип для Nfactrial Incubator: Next.js 14, TypeScript, Tailwind, Supabase, OpenAI AI Coach, Stripe monetization и Vercel deploy.

## Что сделано

### Уровень 1 — фундамент UI
- Статическая сетка 9×9.
- Ввод чисел 1–9.
- Базовая mobile-first верстка.

### Уровень 2 — базовая логика
- Проверка правил Судоку в реальном времени.
- Нет повторов в строках, столбцах и блоках 3×3.
- Кнопка «Проверить решение».
- Таймер-секундомер.
- Сложности Easy, Medium, Hard.
- LocalStorage-ready offline сохранение.

### Уровень 3 — полноценный сервис
- Генератор уникальных Судоку через backtracking + удаление чисел.
- 4 сложности: Easy, Medium, Hard, Expert.
- Notes / pencil mode.
- Hint system.
- История ошибок.
- Статистика: среднее время, точность, количество прохождений.
- Supabase Auth: email/password и Google OAuth.
- Supabase Database: профиль, прогресс, сессии, статистика.
- Темная/светлая тема.
- Адаптивный дизайн для телефона.

### Уровень 4 — вау-фичи
- Daily Challenge с одинаковым seed на день.
- Общий рейтинг по времени и точности.
- Награды и бейджи.
- AI Coach на OpenAI API: объясняет кандидатов, скрытые пары, точку зрения и пошаговые стратегии.
- Глобальный лидерборд.
- Лидерборд по городам, включая «Топ игроков из Алматы».
- Профиль пользователя с avatar, stats и badges.
- Уникальная ниша: Brain Morning Sudoku — утреннее Судоку для подготовки мозга.
- Upgrade to Pro + Stripe webhook / mock checkout.

## Для кого это

Целевая аудитория: умные взрослые 25–45 лет, которые хотят тренировать мозг перед работой, любят короткие полезные привычки и соревновательные рейтинги.

## Почему это ценно

Проект объединяет три сильных retention-механики:

1. Daily Challenge — привычка возвращаться каждый день.
2. AI Coach — обучение, а не просто игра.
3. City Leaderboards — локальная социальная конкуренция, особенно для Алматы.

## Уникальная ниша

Brain Morning Sudoku — «утреннее Судоку для подготовки мозга». Вместо случайной головоломки пользователь получает короткую, полезную, повторяемую утреннюю практику на 5–10 минут.

## Как запустить локально

```bash
git clone https://github.com/your-name/brain-morning-sudoku.git
cd brain-morning-sudoku
npm install
cp .env.local.example .env.local
npm run dev
```

Откройте `http://localhost:3000`.

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Supabase setup

1. Создать проект Supabase.
2. Открыть SQL Editor.
3. Вставить `supabase/schema.sql`.
4. Включить Email Auth.
5. Настроить Google OAuth provider.
6. Скопировать URL и anon key в `.env.local`.

## Как деплоить на Vercel

1. Загрузить проект на GitHub.
2. Импортировать репозиторий в Vercel.
3. Добавить env vars: Supabase, OpenAI, Stripe.
4. Нажать Deploy.
5. В Supabase Auth добавить Vercel URL в redirect URLs.
6. В Stripe добавить webhook URL: `/api/stripe/webhook`.

## Monetization Strategy

Модель: freemium + Pro subscription.

Цена:
- $4.99/month
- $49.99/year

Pro включает:
- кастомные скины сетки;
- безлимитные подсказки;
- отключение рекламы;
- эксклюзивные Expert+ уровни;
- расширенная аналитика прогресса;
- AI Coach без лимитов.

## Future Features

- Multiplayer race: кто быстрее решит одно Судоку.
- Турниры по городам и компаниям.
- Mobile app на React Native.
- Push notifications для Morning Streak.
- AI-generated personalized training plans.
- Corporate wellness subscriptions.
- Realtime spectator mode на Supabase Realtime.

## Авторы

Автор: Full-Stack / Product / AI Engineer  
Контакты: your-email@example.com  
GitHub: https://github.com/your-name
