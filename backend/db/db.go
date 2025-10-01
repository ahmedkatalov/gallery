package db

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
	"main.go/config"
)

var DB *sql.DB

func Init() {
    var err error
    DB, err = sql.Open("postgres", config.DB_URL)
    if err != nil {
        log.Fatal("Failed to connect to DB:", err)
    }

    if err = DB.Ping(); err != nil {
        log.Fatal("DB unreachable:", err)
    }

    log.Println("Database connected")
}
