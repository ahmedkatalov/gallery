# Forged Gallery — Frontend (React + Vite)

## Быстрый старт (локально)
1. Скопируйте `.env.example` в `.env` и при необходимости измените значения:
   ```
   VITE_API_URL=http://localhost:8080
   VITE_WHATSAPP_PHONE=+31612345678
   ```
2. Установите зависимости и запустите dev-сервер:
   ```bash
   npm install
   npm run dev
   ```
3. Откройте http://localhost:5173

## Сборка и запуск в Docker
```bash
docker build -t forged-frontend .
docker run -d --name forged_frontend -p 3000:80 forged-frontend
```
Приложение будет доступно на http://localhost:3000

## Замечания
- API должен быть доступен по `VITE_API_URL` (по умолчанию `http://localhost:8080`).
- Роут `/photo/:id` даёт прямую ссылку на конкретное фото — подходит для отправки в WhatsApp.