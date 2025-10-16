# === Stage 1: Build ===
FROM node:20-alpine AS build
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci || npm install

# Копируем всё остальное
COPY . .

# Передаём аргументы сборки
ARG VITE_API_URL
ARG VITE_WHATSAPP_PHONE
ARG VITE_SECRET_CODE

# Делаем их переменными окружения для Vite
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WHATSAPP_PHONE=${VITE_WHATSAPP_PHONE}
ENV VITE_SECRET_CODE=${VITE_SECRET_CODE}

# Сборка фронта
RUN echo "⚙️ Building with API URL: $VITE_API_URL" && npm run build

# === Stage 2: Nginx runtime ===
FROM nginx:1.27-alpine

# Копируем nginx-конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранный фронт
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK CMD wget -qO- http://127.0.0.1/ || exit 1
