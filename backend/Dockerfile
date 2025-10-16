FROM golang:1.24.5-alpine AS builder
WORKDIR /app

RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd

FROM alpine:3.20
WORKDIR /app
RUN apk add --no-cache curl
RUN addgroup -S appuser && adduser -S -G appuser appuser \
    && mkdir -p /app/static/uploads \
    && chown -R appuser:appuser /app/static/uploads

COPY --from=builder /app/server /app/server
USER appuser

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8080/api/health || exit 1

CMD ["/app/server"]
