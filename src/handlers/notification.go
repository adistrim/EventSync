package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type Notification struct {
	UserID  int    `json:"user_id"`
	Content string `json:"content"`
}

func CreateNotificationHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var notification Notification
		if err := json.NewDecoder(r.Body).Decode(&notification); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		query := `INSERT INTO Notifications (user_id, content) VALUES ($1, $2)`
		_, err := db.Exec(query, notification.UserID, notification.Content)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "notification created"})
	}
}
