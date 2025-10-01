package utils

import (
    "fmt"
    "math/rand"
    "strings"
    "time"
)

func GenerateFilename(original string) string {
    ext := ""
    parts := strings.Split(original, ".")
    if len(parts) > 1 {
        ext = "." + parts[len(parts)-1]
    }
    rand.Seed(time.Now().UnixNano())
    return fmt.Sprintf("%d_%d%s", time.Now().Unix(), rand.Intn(1000), ext)
}
