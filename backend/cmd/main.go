package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"main.go/config"
	"main.go/db"
	"main.go/handlers"
	"main.go/middleware"
)

func main() {
	config.LoadEnv()
	db.Init()

	r := mux.NewRouter()
	r.Use(middleware.CorsMiddleware)

	r.HandleFunc("/api/photos", handlers.UploadPhotos).Methods("POST")
	r.HandleFunc("/api/photos", handlers.GetPhotos).Methods("GET")
	r.HandleFunc("/api/photos/{id}", handlers.DeletePhoto).Methods("DELETE")

	// Статические файлы
	fs := http.FileServer(http.Dir("./static/uploads"))
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", fs))

	// 🌐 Вот этот блок ОБЯЗАТЕЛЕН для CORS с DELETE
	r.Methods(http.MethodOptions).HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
