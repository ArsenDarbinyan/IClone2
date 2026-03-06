# Инструкция по деплою на Vercel

## Что нужно сделать вашему товарищу:

### 1. Подготовка проекта

Убедитесь, что в проекте есть все файлы:
- `server.js` - бэкенд
- `index.html` - главная страница
- `admin.html` - админ панель
- `style.css` - стили
- `script.js` - фронтенд скрипт
- `package.json` - зависимости
- `vercel.json` - конфигурация Vercel (уже создан)

### 2. Настройка базы данных

**ВАЖНО:** Vercel не поддерживает PostgreSQL в бесплатном тарифе. Нужно использовать:

#### Вариант А: Vercel Postgres (рекомендуется)
1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Создайте новый проект: `Storage` → `Postgres`
3. Скопируйте `DATABASE_URL`
4. Добавьте в Environment Variables в Vercel проекте

#### Вариант Б: MongoDB Atlas (проще)
1. Создайте аккаунт в [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Создайте бесплатный кластер
3. Получите `DATABASE_URL`

### 3. Деплой на Vercel

#### Способ 1: Через Git (рекомендуется)
```bash
# Залить на GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/iclone-evn.git
git push -u origin main

# Подключить репозиторий в Vercel
1. Зайдите на vercel.com
2. Click "New Project"
3. Выберите GitHub репозиторий
4. Vercel автоматически определит Node.js проект
```

#### Способ 2: Через Vercel CLI
```bash
# Установить Vercel CLI
npm i -g vercel

# Залогиниться
vercel login

# Задеплоить
vercel --prod
```

### 4. Environment Variables

В Vercel Dashboard → Settings → Environment Variables добавьте:

```
DATABASE_URL=ваша_ссылка_на_базу_данных
JWT_SECRET=iclone_secret_key_2024
PORT=3001
```

### 5. Если используете PostgreSQL

Нужно немного изменить `server.js` для production:

```javascript
// Заменить подключение к базе
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### 6. Проверка

После деплоя проверьте:
- Главная страница: `https://ваш-домен.vercel.app`
- Админ панель: `https://ваш-домен.vercel.app/admin`
- API: `https://ваш-домен.vercel.app/api/products`

### 7. Возможные проблемы

#### Ошибка: "Cannot find module"
- Убедитесь что `package.json` содержит все зависимости
- Проверьте что все файлы загружены в Git

#### Ошибка: Database connection
- Проверьте `DATABASE_URL` в Environment Variables
- Убедитесь что база данных доступна извне

#### Ошибка: 404 на API
- Проверьте `vercel.json` конфигурацию
- API эндпоинты должны работать через `/api/*`

### 8. Альтернатива: Render.com

Если Vercel не работает, попробуйте [Render](https://render.com):
1. Бесплатный тариф для Node.js
2. Поддержка PostgreSQL
3. Автоматический деплой с GitHub

---

## Краткая инструкция для товарища:

1. **Создай аккаунт на Vercel.com**
2. **Загрузи проект на GitHub**
3. **Подключи GitHub репозиторий в Vercel**
4. **Добавь Environment Variables** (DATABASE_URL, JWT_SECRET)
5. **Нажми Deploy**

Готово! Проект будет доступен на `https://твой-проект.vercel.app`
