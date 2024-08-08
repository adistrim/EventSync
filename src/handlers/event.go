package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/adistrim/gohttp/utils"
)

type Event struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	Date        time.Time `json:"date"`
	Category    string    `json:"category"`
}

func CreateEventHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		claims, err := utils.VerifyToken(token[7:])
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		var event Event
		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var creatorID int
		err = db.QueryRow("SELECT id FROM Users WHERE email = $1", claims.Email).Scan(&creatorID)
		if err != nil {
			http.Error(w, "Failed to get creator ID", http.StatusInternalServerError)
			return
		}

		query := `INSERT INTO Events (name, description, location, date, category, creator_id)
                  VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
		var id int
		err = db.QueryRow(query, event.Name, event.Description, event.Location, event.Date, event.Category, creatorID).Scan(&id)
		if err != nil {
			http.Error(w, "Failed to create event: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]int{"id": id})
	}
}

func GetEventsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		claims, err := utils.VerifyToken(token[7:])
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		var creatorID int
		err = db.QueryRow("SELECT id FROM Users WHERE email = $1", claims.Email).Scan(&creatorID)
		if err != nil {
			http.Error(w, "Failed to get creator ID", http.StatusInternalServerError)
			return
		}

		rows, err := db.Query(`SELECT name, description, location, date, category FROM Events WHERE creator_id = $1`, creatorID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var events []Event
		for rows.Next() {
			var event Event
			if err := rows.Scan(&event.Name, &event.Description, &event.Location, &event.Date, &event.Category); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			events = append(events, event)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(events)
	}
}

func GetUserEventsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		claims, err := utils.VerifyToken(token[7:])
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		var userID int
		err = db.QueryRow("SELECT id FROM Users WHERE email = $1", claims.Email).Scan(&userID)
		if err != nil {
			http.Error(w, "Failed to get user ID", http.StatusInternalServerError)
			return
		}

		query := `
			SELECT e.name, e.description, e.location, e.date, e.category
			FROM Events e
			INNER JOIN Participants p ON e.id = p.event_id
			WHERE p.user_id = $1`
		rows, err := db.Query(query, userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var events []Event
		for rows.Next() {
			var event Event
			if err := rows.Scan(&event.Name, &event.Description, &event.Location, &event.Date, &event.Category); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			events = append(events, event)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(events)
	}
}
