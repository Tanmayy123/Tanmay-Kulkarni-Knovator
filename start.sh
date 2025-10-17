#!/bin/bash
echo "Starting Job Importer System..."
echo

echo "Starting Express API server..."
gnome-terminal -- bash -c "cd server && npm run dev; exec bash" &

echo "Waiting 3 seconds for API to start..."
sleep 3

echo "Starting BullMQ Worker..."
gnome-terminal -- bash -c "cd server && npm run worker; exec bash" &

echo "Waiting 2 seconds for worker to start..."
sleep 2

echo "Starting Next.js Client..."
gnome-terminal -- bash -c "cd client && npm run dev; exec bash" &

echo
echo "All services started!"
echo "- API Server: http://localhost:4000"
echo "- Client UI: http://localhost:3000"
echo "- Health Check: http://localhost:4000/api/health"
echo
