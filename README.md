Job Importer with Queue Processing & History Tracking

Tech stack
- Backend: Node.js (Express), Mongoose, BullMQ, Redis, node-cron
- Frontend: Next.js (App Router, JavaScript), Tailwind CSS
- Database: MongoDB

Monorepo structure
- /client – Next.js admin UI
- /server – Express API, cron, BullMQ queue and worker
- /docs/architecture.md – Design and decisions

Prerequisites
1) Node.js >= 18 (recommended 18.18+). Current client uses Next 13.
2) MongoDB running locally or Atlas URI
3) Redis running locally or Redis Cloud URL

Environment variables
Server (.env file in /server)
- PORT=4000
- MONGODB_URI=mongodb://localhost:27017/job_importer
- REDIS_URL=redis://localhost:6379
- QUEUE_NAME=job-import-queue
- CRON_SCHEDULE=0 * * * *
- LOG_LEVEL=dev

Client (.env.local in /client)
- NEXT_PUBLIC_API_BASE=http://localhost:4000/api

Install & run
1) Install dependencies
   - server
     - cd server
     - npm install
   - client
     - cd ../client
     - npm install

2) Start backend (in two terminals)
   - API server (Express):
     - cd server
     - npm run dev
   - Worker (BullMQ):
     - cd server
     - npm run worker

3) Start frontend
   - cd client
   - npm run dev
   - Open http://localhost:3000

How it works
- Cron (hourly by default) enqueues an import run
- Worker fetches configured XML feeds, converts to JSON, normalizes items
- Jobs are upserted in MongoDB with unique (sourceUrl, externalId)
- For each feed, an import log is written with totals and failures
- Admin UI shows import logs and provides a manual Trigger Import button

API endpoints (server)
- GET /api/health – health check
- GET /api/logs – latest import log entries
- POST /api/import/trigger – enqueue an import run manually

Notes & assumptions
- Dedupe uses (sourceUrl, externalId). If a feed lacks guid/id/link we fall back to title.
- Concurrency is configurable via WORKER_CONCURRENCY (default 5).
- Retries use BullMQ exponential backoff for job-upsert tasks.
- No Docker used. You can deploy server to Render/railway and client to Vercel. Use MongoDB Atlas + Redis Cloud URLs.

Troubleshooting
- create-next-app prompts: this repo already contains a client scaffold; just run npm install in /client.
- Node version: If Next CLI warns, upgrade Node to >= 18.18.
- CORS: server enables CORS for local development by default.


