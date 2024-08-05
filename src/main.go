package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func enableCORS(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		handler.ServeHTTP(w, r)
	})
}

func main() {
	// Initialize the database
	initDB()
	defer getDB().Close()

	mux := http.NewServeMux()

	// HTTP handler to fetch and display users
	mux.Handle("/users", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		rows, err := getDB().Query("SELECT id, name, email FROM users")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var users []User
		for rows.Next() {
			var user User
			if err := rows.Scan(&user.ID, &user.Name, &user.Email); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			users = append(users, user)
		}

		if err = rows.Err(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := json.NewEncoder(w).Encode(users); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})))

	// Serve static files
	fs := http.FileServer(http.Dir("static/"))
	mux.Handle("/static/", enableCORS(http.StripPrefix("/static/", fs)))

	// Start the server
	serverPort := os.Getenv("SERVER_PORT")
	if serverPort == "" {
		serverPort = "8080" // Default port if not specified in .env
	}
	log.Printf("Listening on :%s...", serverPort)
	if err := http.ListenAndServe(":"+serverPort, mux); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
