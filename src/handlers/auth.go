package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/adistrim/gohttp/utils"

	_ "github.com/lib/pq"
)

type RegisterCredentials struct {
	Name     string `json:"name"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func RegisterHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var creds RegisterCredentials
		err := json.NewDecoder(r.Body).Decode(&creds)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		hashedPassword, err := utils.HashPassword(creds.Password)
		if err != nil {
			http.Error(w, "Error hashing password", http.StatusInternalServerError)
			return
		}

		_, err = db.Exec("INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4)", creds.Name, creds.Username, creds.Email, hashedPassword)
		if err != nil {
			http.Error(w, "Error inserting user: "+err.Error(), http.StatusConflict)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

func LoginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var creds Credentials
		err := json.NewDecoder(r.Body).Decode(&creds)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		var hashedPassword string
		err = db.QueryRow("SELECT password FROM users WHERE email = $1", creds.Email).Scan(&hashedPassword)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Invalid email", http.StatusUnauthorized)
			} else {
				http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			}
			return
		}

		if !utils.CheckPasswordHash(creds.Password, hashedPassword) {
			http.Error(w, "Invalid password", http.StatusUnauthorized)
			return
		}

		token, err := utils.GenerateJWT(creds.Email)
		if err != nil {
			http.Error(w, "Error generating token: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"token": token})
	}
}
