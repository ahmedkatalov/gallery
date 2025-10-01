package models

import "time"

type Photo struct {
    ID          int       `json:"id"`
    GroupID     string    `json:"group_id"`
    Filename    string    `json:"filename"`
    Description string    `json:"description"`
    CreatedAt   time.Time `json:"created_at"`
}
