package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/mux"

	"main.go/config"
	"main.go/db"
	"main.go/models"
	"main.go/utils"
)

// допустимые категории
var allowedCats = map[string]bool{
	"gates":  true, // Ворота
	"rails":  true, // Перила
	"canopy": true, // Навесы
}

// нормализация категории (дефолт "gates")
func normalizeCategory(s string) string {
	s = strings.TrimSpace(strings.ToLower(s))
	if allowedCats[s] {
		return s
	}
	return "gates"
}

// POST /api/photos
func UploadPhotos(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10MB
		http.Error(w, "Invalid multipart form", http.StatusBadRequest)
		return
	}

	// секретный код
	code := r.FormValue("code")
	if code != config.SecretCode {
		http.Error(w, "Invalid secret code", http.StatusUnauthorized)
		return
	}

	description := r.FormValue("description")
	category := normalizeCategory(r.FormValue("category")) // 🔸 ВАЖНО: берём и нормализуем категорию
	files := r.MultipartForm.File["photos"]

	if len(files) == 0 || len(files) > 4 {
		http.Error(w, "You must upload from 1 to 4 photos", http.StatusBadRequest)
		return
	}

	// Папка для загрузок
	if err := os.MkdirAll(config.UploadFolder, 0o755); err != nil {
		http.Error(w, "Failed to prepare upload folder", http.StatusInternalServerError)
		return
	}

	groupID := uuid.New().String()
	savedPhotos := make([]models.Photo, 0, len(files))

	for _, fh := range files {
		file, err := fh.Open()
		if err != nil {
			http.Error(w, "Failed to open file", http.StatusInternalServerError)
			return
		}
		defer file.Close()

		filename := utils.GenerateFilename(fh.Filename)
		dstPath := filepath.Join(config.UploadFolder, filename)

		out, err := os.Create(dstPath)
		if err != nil {
			http.Error(w, "Failed to save file", http.StatusInternalServerError)
			return
		}
		if _, err := io.Copy(out, file); err != nil {
			out.Close()
			_ = os.Remove(dstPath)
			http.Error(w, "Failed to write file", http.StatusInternalServerError)
			return
		}
		_ = out.Close()

		var id int
		// 🔸 ТЕПЕРЬ ПИШЕМ category В INSERT
		if err := db.DB.QueryRow(
			`INSERT INTO photos (filename, description, group_id, category)
			 VALUES ($1, $2, $3, $4) RETURNING id`,
			filename, description, groupID, category,
		).Scan(&id); err != nil {
			_ = os.Remove(dstPath)
			http.Error(w, "DB insert error", http.StatusInternalServerError)
			return
		}

		savedPhotos = append(savedPhotos, models.Photo{
			ID:          id,
			GroupID:     groupID,
			Filename:    filename,
			Description: description,
			// Category можно добавить в модель, если нужно отдавать на фронт
		})
	}

	_ = json.NewEncoder(w).Encode(savedPhotos)
}

// GET /api/photos?category=gates|rails|canopy (необязательный фильтр)
func GetPhotos(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	cat := strings.TrimSpace(r.URL.Query().Get("category"))
	where := ""
	var args []any
	if cat != "" {
		cat = normalizeCategory(cat)
		where = "WHERE category = $1"
		args = append(args, cat)
	}

	// Отдаём по группам; внутри — массив фото (без дублирования group_id)
	q := fmt.Sprintf(`
		SELECT group_id,
		       json_agg(
		         json_build_object(
		           'id', id,
		           'filename', filename,
		           'description', description,
		           'created_at', created_at
		         )
		         ORDER BY created_at
		       ) AS photos
		FROM photos
		%s
		GROUP BY group_id
		ORDER BY MAX(created_at) DESC
	`, where)

	rows, err := db.DB.Query(q, args...)
	if err != nil {
		http.Error(w, "DB query error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type Grouped struct {
		GroupID string          `json:"group_id"`
		Photos  json.RawMessage `json:"photos"`
	}

	var groups []Grouped
	for rows.Next() {
		var g Grouped
		if err := rows.Scan(&g.GroupID, &g.Photos); err != nil {
			http.Error(w, "DB scan error", http.StatusInternalServerError)
			return
		}
		groups = append(groups, g)
	}
	if err := rows.Err(); err != nil {
		http.Error(w, "DB rows error", http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(groups)
}

// DELETE /api/photos/{id} — удаляет ВЕСЬ альбом по group_id фото
func DeletePhoto(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]

	code := r.URL.Query().Get("code")
	if code != config.SecretCode {
		http.Error(w, "Invalid secret code", http.StatusUnauthorized)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// Находим group_id по id фото
	var groupID string
	if err := db.DB.QueryRow(`SELECT group_id FROM photos WHERE id = $1`, id).Scan(&groupID); err != nil {
		http.Error(w, "Photo not found", http.StatusNotFound)
		return
	}

	// Список файлов группы
	rows, err := db.DB.Query(`SELECT filename FROM photos WHERE group_id = $1`, groupID)
	if err != nil {
		http.Error(w, "Failed to fetch filenames", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var filenames []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err == nil {
			filenames = append(filenames, name)
		}
	}

	// Чистим БД
	if _, err := db.DB.Exec(`DELETE FROM photos WHERE group_id = $1`, groupID); err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	// Чистим файлы на диске
	for _, name := range filenames {
		_ = os.Remove(filepath.Join(config.UploadFolder, name))
	}

	w.WriteHeader(http.StatusNoContent)
}
