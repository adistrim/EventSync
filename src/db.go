package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var db *sql.DB

func initDB() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Construct DSN from environment variables
	connStr := fmt.Sprintf("postgresql://%s:%s@%s/%s?sslmode=require",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_NAME"),
	)

	// Open the database connection
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	// Test the database connection
	if err = db.Ping(); err != nil {
		log.Fatalf("Error pinging database: %v", err)
	}
}

func getDB() *sql.DB {
	return db
}
