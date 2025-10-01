# ==== Build stage ====
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm install

COPY . .
ARG VITE_API_URL
ARG VITE_WHATSAPP_PHONE
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WHATSAPP_PHONE=$VITE_WHATSAPP_PHONE

RUN npm run build

# ==== Runtime (Nginx) ====
FROM nginx:1.27-alpine
# ❗ если у тебя нет своего nginx.conf, можно удалить эту строку
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

HEALTHCHECK CMD wget -qO- http://127.0.0.1/ || exit 1
