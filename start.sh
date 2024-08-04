#!/bin/bash

GO_SERVER_DIR="src"
FRONTEND_DIR="frontend"

echo "Starting Go server..."
cd "$GO_SERVER_DIR" || { echo "Failed to change directory to Go server"; exit 1; }
go run main.go &

cd ..

echo "Starting frontend..."
cd "$FRONTEND_DIR" || { echo "Failed to change directory to frontend"; exit 1; }
npm run dev &

wait

echo "Both server and frontend are running."
