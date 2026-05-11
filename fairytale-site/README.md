# 🧚 Казковий Край — Інструкція з налаштування

Повністю автоматичний сайт казок: GitHub Actions генерує нову казку через Claude AI щодня о 7:00, зберігає в Supabase, і сайт на Vercel відразу її показує.

---

## Крок 1 — Supabase (база даних)

1. Зайди на [supabase.com](https://supabase.com) → **New Project**
2. Дай назву проєкту (наприклад: `fairytale-site`)
3. Запам'ятай пароль бази даних
4. Після створення → **SQL Editor** → вставте весь вміст файлу `supabase-setup.sql` → **Run**

Це створить таблицю `stories` з правильними правами доступу.

### Де знайти ключі Supabase:
- **Settings → API**
  - `NEXT_PUBLIC_SUPABASE_URL` — поле "Project URL"
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — поле "anon public"
  - `SUPABASE_SERVICE_ROLE_KEY` — поле "service_role" ⚠️ Тримай у секреті!

---

## Крок 2 — GitHub (репозиторій)

1. Створи новий репозиторій на [github.com](https://github.com)
2. Завантаж всі файли проєкту в репозиторій:
   ```bash
   git init
   git add .
   git commit -m "🧚 Початковий коміт"
   git remote add origin https://github.com/ТВІЙ_ЮЗЕР/ТВІЙ_РЕПО.git
   git push -u origin main
   ```

### Додай секрети до GitHub:
**Settings → Secrets and variables → Actions → New repository secret**

| Назва секрету | Значення |
|---|---|
| `CRON_SECRET` | Придумай будь-який рядок, наприклад: `my-secret-abc123` |
| `VERCEL_APP_URL` | URL твого сайту на Vercel (додамо після кроку 3) |

---

## Крок 3 — Vercel (хостинг)

1. Зайди на [vercel.com](https://vercel.com) → **Add New Project**
2. Вибери твій GitHub репозиторій
3. Vercel автоматично визначить Next.js
4. **Environment Variables** — додай всі змінні:

| Змінна | Де взяти |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `CRON_SECRET` | Той самий рядок що в GitHub Secrets |

5. Натисни **Deploy** 🚀
6. Після деплою скопіюй URL сайту (наприклад: `https://fairytale-site.vercel.app`)
7. **Повернись до GitHub** → Settings → Secrets → додай `VERCEL_APP_URL` = твій URL

---

## Крок 4 — Тест

Перевір що все працює:

```bash
# Тригер генерації вручну через curl
curl -X POST \
  -H "Authorization: Bearer your-secret-abc123" \
  https://fairytale-site.vercel.app/api/generate-story
```

Або в GitHub → **Actions** → **Генерація щоденної казки** → **Run workflow**

---

## Як це працює автоматично

```
Щодня о 05:00 UTC (07:00 Київ)
         ↓
GitHub Actions запускає workflow
         ↓
Викликає POST /api/generate-story на Vercel
         ↓
Vercel звертається до Claude AI
         ↓
Claude генерує нову казку українською
         ↓
Казка зберігається в Supabase
         ↓
Сайт автоматично показує нову казку
```

---

## Структура проєкту

```
fairytale-site/
├── app/
│   ├── page.tsx              # Головна сторінка (список казок)
│   ├── layout.tsx            # Корінь HTML з метаданими
│   ├── globals.css           # Стилі сайту
│   └── story/[id]/
│       └── page.tsx          # Сторінка однієї казки
├── app/api/generate-story/
│   └── route.ts              # API endpoint для генерації
├── lib/
│   └── supabase.ts           # Supabase клієнт
├── .github/workflows/
│   └── daily-story.yml       # GitHub Actions cron job
├── supabase-setup.sql        # SQL для налаштування БД
└── .env.local.example        # Шаблон змінних середовища
```

---

## Додаткові налаштування

### Змінити час генерації
У файлі `.github/workflows/daily-story.yml` знайди:
```yaml
- cron: '0 5 * * *'
```
- `0 5 * * *` = 05:00 UTC = 07:00 Київ (UTC+2)
- `0 4 * * *` = 04:00 UTC = 06:00 Київ (UTC+2)

### Додати нові теми казок
У файлі `app/api/generate-story/route.ts` знайди масив `STORY_THEMES` і додай свої теми.

---

## Потрібна допомога?

- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- GitHub Actions: [docs.github.com/actions](https://docs.github.com/actions)
