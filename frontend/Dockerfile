# === Stage 1: Build ===
FROM node:20-alpine AS build
WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci || npm install

# Копируем весь проект
COPY . .

# Подтягиваем переменные окружения из docker-compose
ARG VITE_API_URL
ARG VITE_WHATSAPP_PHONE
ARG VITE_SECRET_CODE

# Прокидываем их в ENV, чтобы Vite смог использовать
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WHATSAPP_PHONE=${VITE_WHATSAPP_PHONE}
ENV VITE_SECRET_CODE=${VITE_SECRET_CODE}

# 🧠 Добавляем вывод для проверки
RUN echo "⚙️ Building with VITE_API_URL=$VITE_API_URL" && npm run build

# === Stage 2: Nginx runtime ===
FROM nginx:1.27-alpine

# Копируем nginx конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранный билд
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK CMD wget -qO- http://127.0.0.1/ || exit 1
