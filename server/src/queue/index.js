const { Queue } = require('bullmq');
const IORedis = require('ioredis');

let jobQueue;

function getConnection() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true
  });
}

async function initializeQueues() {
  const connection = getConnection();
  jobQueue = new Queue(process.env.QUEUE_NAME || 'job-import-queue', { connection });
}

async function enqueueImportRun(payload) {
  if (!jobQueue) await initializeQueues();
  return jobQueue.add('import-run', payload || {}, { removeOnComplete: true, removeOnFail: false });
}

async function enqueueJobUpsert(job) {
  if (!jobQueue) await initializeQueues();
  return jobQueue.add('job-upsert', job, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 1000,
    removeOnFail: false,
  });
}

module.exports = { initializeQueues, enqueueImportRun, enqueueJobUpsert };


