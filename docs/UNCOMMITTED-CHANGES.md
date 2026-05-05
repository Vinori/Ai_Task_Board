# Незакоммиченные изменения (сводка)

Документ составлен по состоянию рабочей копии: **изменённые** (`git diff`) и **новые неотслеживаемые** (`git status`) файлы.

---

## Зависимости и скрипты (`package.json`)

- Добавлены **Supabase** (`@supabase/supabase-js`), **Firebase** (`firebase`) и **`firebase-tools`** (dev).
- Скрипты: **`deploy:hosting`**, **`firebase`**, **`firebase:login`**, **`firebase:logout`** и варианты логина для CI / без localhost.
- Значительно обновлён **`package-lock.json`** (под новые пакеты).

---

## Конфигурация и деплой

| Путь | Назначение |
|------|------------|
| `firebase.json` | Hosting: публикация из `dist`, SPA-rewrite всех путей на `index.html`. |
| `.firebaserc` | Привязка Firebase-проекта (локальная конфигурация CLI). |
| `.firebase/hosting.ZGlzdA.cache` | Кэш деплоя Firebase Hosting (артефакт CLI). |
| `public/index.html`, `public/404.html` | Статические страницы для хостинга (если не используются только Vite `dist`). |
| `Y/index.html` | Дополнительный статический файл в корне (не в `public/`). |
| `index.html` | Правки под текущий билд / мета (см. diff). |

---

## Переменные окружения (`src/vite-env.d.ts`)

Объявлены типы для **`ImportMetaEnv`**:

- AI: `VITE_AI_ENDPOINT`, `VITE_AI_API_KEY`
- Firebase Auth: `VITE_FIREBASE_*` (apiKey, authDomain, projectId и т.д.)
- Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## Точка входа и маршрутизация

- **`src/main.tsx`**: обёртки **`BrowserRouter`** → **`AuthSync`** → **`ThemeRoot`** → приложение; подключён глобальный CSS.
- **`src/App.tsx`**: маршруты внутри **`AppLayout`**: `/`, `/features`, `/how-it-works`, `/pricing`, **`/dashboard`**.

---

## Новые библиотеки и сторы

| Файл | Назначение |
|------|------------|
| `src/lib/supabase.ts` | Ленивый singleton `getSupabase()` при наличии URL и anon key в env. |
| `src/lib/firebase.ts`, `src/lib/firebaseAuth.ts` | Инициализация Firebase и хелперы для веб-аутентификации (при настроенных env). |
| `src/store/authStore.ts` | Zustand: текущий пользователь Supabase (`user` / `setUser`). |
| `src/store/uiStore.ts` | Zustand + persist: тема, локаль (ru/en), открытие сайдбара досок; без дублирования данных досок (доски в `boardsStore`). |
| `src/store/boardsStore.ts` | Список досок, загрузка/ошибка, активная доска, **`addBoard`**, **`deleteBoard`**, сброс. |

---

## API слой (Supabase)

| Файл | Назначение |
|------|------------|
| `src/api/boards.ts` | **`fetchBoards`**, **`createBoard`**, **`deleteBoard`**; тип **`BoardRow`**. |
| `src/api/boardMembers.ts` | Участники досок: **`searchUsers`** (профили, безопасный `ilike`), **`fetchBoardMembers`**, **`addBoardMember`**, **`removeBoardMember`**; типы **`ProfileRow`**, **`BoardMemberRow`**. |

Ожидаемые таблицы на стороне Supabase (логика приложения): **`boards`**, **`profiles`**, **`board_members`**, политики RLS (включая доступ к доскам владельцу и участникам, удаление доски владельцем, каскад при удалении доски). SQL миграции в этом репозитории **не перечислены** — схема применялась в проект Supabase отдельно.

---

## Компоненты layout и auth

| Файл | Назначение |
|------|------------|
| `src/components/layout/AuthSync.tsx` | Синхронизация сессии Supabase Auth с `authStore` (`getSession` + `onAuthStateChange`). |
| `src/components/layout/ThemeRoot.tsx` | Применение темы из `uiStore` к `document.documentElement` (`dark` class / `data-theme`). |
| `src/components/layout/AppLayout.tsx` | Шапка с **`MainNav`** и **`HeaderControls`**; **`BoardsSidebar`** только если **`user !== null`**; контент — **`Outlet`**. |
| `src/components/layout/HeaderControls.tsx` | Тема, локаль, вход/регистрация, меню пользователя, переключатель левой панели досок **только для авторизованных**. |
| `src/components/layout/BoardsSidebar.tsx` | Левая панель: загрузка досок, ошибки, список карточек, **создание доски**, **настройки** (шестерёнка), **удаление красной корзиной только для создателя** (`board.user_id === user.id`), подтверждение `confirm`, закрытие модалки настроек при удалении текущей доски. |
| `src/components/layout/MainNav.tsx` | Навигация с локализацией из `navCopy`, адаптивное меню, **`NavLink`**. |

---

## Модалки

| Файл | Назначение |
|------|------------|
| `src/components/modals/Modal.tsx` | Базовый модальный контейнер (обновлённая разметка/стили/доступность — см. diff). |
| `src/components/modals/AuthModal.tsx` | Вход / регистрация (email-пароль, Google при настройке), ошибки из `navCopy`. |
| `src/components/modals/CreateBoardModal.tsx` | Создание доски через **`boardsStore.addBoard`**. |
| `src/components/modals/BoardSettingsModal.tsx` | Поиск пользователей по **`profiles`**, список участников, добавление/удаление (владелец), бэкенд через **`boardMembers` API**. |

---

## Локализация

- **`src/i18n/nav.ts`**: строки навигации, форм авторизации, дашборда и тип **`NavCopy`**.

---

## Страницы

- **`src/pages/Dashboard.tsx`**: страница после входа (приветствие, ссылка к доске и т.п. — см. файл).
- **`src/pages/Home.tsx`**, **`Features.tsx`**, **`HowItWorks.tsx`**, **`Pricing.tsx`**: правки под новый layout/копирайт/ссылки (см. diff).

---

## Kanban, карточки, кнопки

- **`src/components/kanban/KanbanBoard.tsx`**, **`KanbanColumn.tsx`**, **`TaskCard.tsx`**, **`buttons/Button.tsx`**: доработки стилей и поведения под общий UI (см. diff).

---

## Стили

- **`src/styles/globals.css`**, **`src/styles/tailwind.config.js`**: расширение темы, токены, тёмная тема и утилиты (см. diff).

---

## Тесты

- **`src/App.test.tsx`**: обновления под роутер / новую обёртку приложения.

---

## Прочие изменённые файлы

- **`src/api/tasks.ts`**: в `git status` помечен как изменённый; при сравнении с игнорированием пробелов **явных правок содержимого в diff может не быть** — возможны только нормализация переводов строк (CRLF/LF). Имеет смысл проверить локально `git diff src/api/tasks.ts` перед коммитом.

---

## Как использовать этот документ при коммите

1. Разбить на логические коммиты (например: зависимости → Supabase/API → UI досок → Firebase hosting → стили).
2. Не коммитить без необходимости: `.firebase/*.cache`, секреты `.env`.
3. Убедиться, что в Supabase применены все нужные политики RLS и таблицы, иначе новый фронтенд будет отдавать ошибки API.

---

*Сгенерировано как описание незакоммиченного дерева; при изменении файлов актуализируйте список командой `git status`.*
