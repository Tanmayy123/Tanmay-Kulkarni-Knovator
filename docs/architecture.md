Architecture Overview

Goals
- Pull jobs from multiple XML feeds, transform to JSON, persist in MongoDB
- Use Redis-backed queue for scalable background processing
- Track per-feed import history with totals and failure reasons
- Simple admin UI to trigger imports and view history

High-level components
- Express API (server/src/index.js)
  - Health endpoint, logs endpoint, trigger import endpoint
  - Schedules cron to enqueue hourly imports
- Queue (server/src/queue)
  - BullMQ queue backed by Redis
  - Producers: enqueueImportRun, enqueueJobUpsert (future extension)
- Worker (server/src/workers/jobWorker.js)
  - Processes import-run: fetches all feeds, normalizes items, upserts jobs
  - Updates ImportLog per feed with totals and failure reasons
  - Processes job-upsert: upserts a single job (kept for extensibility)
- MongoDB models
  - Job: unique on (sourceUrl, externalId), stores normalized fields and raw item
  - ImportLog: one per feed per run, stores totals, failures, timestamps
- Feed service (server/src/services/feedService.js)
  - Fetches XML over HTTP, xml2js -> JSON, normalizes to a consistent item shape

Data flow
1) Cron fires (default hourly) -> enqueue import-run job
2) Worker receives import-run -> fetchAllFeeds()
3) For each feed URL -> create ImportLog with totalFetched
4) Upsert each item into Job collection -> count created vs updated
5) Record failures (DB/validation) in ImportLog.failures with reason
6) Update ImportLog with totals and completedAt
7) UI polls /api/logs to display history; user can also POST /api/import/trigger

Scalability considerations
- Worker concurrency controlled via WORKER_CONCURRENCY; increase for throughput
- BullMQ allows multiple worker processes on separate machines
- Import-run can be split: produce per-item job-upsert tasks for very large feeds
- MongoDB indices on (sourceUrl, externalId) ensure dedupe/upsert performance

Reliability
- Exponential backoff on job-upsert retries
- Failures captured per item in ImportLog.failures
- removeOnComplete keeps queues clean; logs live in MongoDB

Security & ops
- CORS enabled for local dev; restrict origins in production
- Env vars for Mongo/Redis URLs; use managed services for deployment

Future enhancements
- Real-time updates via SSE or Socket.IO to stream import progress
- Pagination and filtering for logs, failure drill-down
- Per-feed enable/disable and custom parsing strategies
- Idempotent import-run with runId stored on ImportLog


