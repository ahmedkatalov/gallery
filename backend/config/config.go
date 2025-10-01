package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var (
	DB_URL       string
	SecretCode   string
	UploadFolder string = "./static/uploads"
)

func LoadEnv() {
	// Пробуем подгрузить .env файлы, но НЕ паникуем, если их нет
	_ = godotenv.Load(".env", ".env.local")

	DB_URL = os.Getenv("DATABASE_URL")
	SecretCode = os.Getenv("SECRET_CODE")

	// Вот на этом уже можно валиться — если реально нет значений
	if DB_URL == "" {
		log.Fatal("DATABASE_URL is empty. Provide it via docker compose environment or .env")
	}
	if SecretCode == "" {
		log.Fatal("SECRET_CODE is empty. Provide it via docker compose environment or .env")
	}
}
