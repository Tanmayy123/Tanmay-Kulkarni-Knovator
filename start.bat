@echo off
echo Starting Job Importer System...
echo.

echo Starting MongoDB and Redis (make sure they're running locally)...
echo.

echo Starting Express API server...
start "API Server" cmd /k "cd server && npm run dev"

echo Waiting 3 seconds for API to start...
timeout /t 3 /nobreak > nul

echo Starting BullMQ Worker...
start "Worker" cmd /k "cd server && npm run worker"

echo Waiting 2 seconds for worker to start...
timeout /t 2 /nobreak > nul

echo Starting Next.js Client...
start "Client" cmd /k "cd client && npm run dev"

echo.
echo All services started!
echo - API Server: http://localhost:4000
echo - Client UI: http://localhost:3000
echo - Health Check: http://localhost:4000/api/health
echo.
echo Press any key to exit...
pause > nul
