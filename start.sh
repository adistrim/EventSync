#!/bin/bash

GO_SERVER_DIR="src"
FRONTEND_DIR="frontend"

echo "Starting Go server..."
cd "$GO_SERVER_DIR" || { echo "Failed to change directory to Go server"; exit 1; }
./run_server.sh &

echo "Starting frontend..."
cd ..
cd "$FRONTEND_DIR" || { echo "Failed to change directory to frontend"; exit 1; }
npm run dev &

wait

echo "Both server and frontend are running."
