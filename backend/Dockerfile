# ====== BUILD STAGE ======
FROM golang:1.24.5-alpine AS builder
WORKDIR /app

# Устанавливаем git для go mod
RUN apk add --no-cache git

# Кэшируем зависимости
COPY go.mod go.sum ./
RUN go mod download

# Копируем исходники и билдим
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd

# ====== RUNTIME STAGE ======
FROM alpine:3.20
WORKDIR /app

# Утилиты для healthcheck
RUN apk add --no-cache curl

# Создаем пользователя и папку для загрузок
RUN addgroup -S appuser && adduser -S -G appuser appuser \
    && mkdir -p /app/static/uploads \
    && chown -R appuser:appuser /app/static/uploads

# Копируем бинарник из стадии сборки
COPY --from=builder /app/server /app/server

# Переключаемся на пользователя appuser
USER appuser

EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8080/api/photos || exit 1

CMD ["/app/server"]
