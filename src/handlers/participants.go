package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/adistrim/gohttp/services"
)

type Participant struct {
	UserID  int    `json:"user_id"`
	EventID int    `json:"event_id"`
	Role    string `json:"role"`
}

func AddParticipantsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var participants []Participant
		if err := json.NewDecoder(r.Body).Decode(&participants); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer tx.Rollback()

		for _, p := range participants {
			_, err := tx.Exec(`INSERT INTO Participants (user_id, event_id, role) VALUES ($1, $2, $3)`,
				p.UserID, p.EventID, p.Role)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Fetch user email
			var email string
			err = tx.QueryRow(`SELECT email FROM Users WHERE id = $1`, p.UserID).Scan(&email)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Create notification
			notification := fmt.Sprintf("You have been invited to the event with ID: %d", p.EventID)
			_, err = tx.Exec(`INSERT INTO Notifications (user_id, content) VALUES ($1, $2)`,
				p.UserID, notification)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Send email notification
			err = services.SendEmail(email, "Event Invitation", notification)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
	}
}
