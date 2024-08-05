package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/adistrim/gohttp/handlers"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	connStr := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=require",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	// Open the database connection
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	// Test the database connection
	if err = db.Ping(); err != nil {
		log.Fatalf("Error pinging database: %v", err)
	}

	r := mux.NewRouter()

	r.HandleFunc("/register", handlers.RegisterHandler(db)).Methods("POST")
	r.HandleFunc("/login", handlers.LoginHandler(db)).Methods("POST")

	serverPort := os.Getenv("SERVER_PORT")
	if serverPort == "" {
		serverPort = "8080"
	}
	log.Printf("Listening on :%s...", serverPort)
	log.Fatal(http.ListenAndServe(":"+serverPort, r))
}
