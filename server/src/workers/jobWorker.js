const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const dotenv = require('dotenv');
dotenv.config();

const { connectToDatabase } = require('../lib/db');
const Job = require('../models/Job');
const ImportLog = require('../models/ImportLog');
const { fetchAllFeeds } = require('../services/feedService');

function getConnection() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true
  });
}

async function upsertJob(doc) {
  const filter = { sourceUrl: doc.sourceUrl, externalId: doc.externalId };
  const existing = await Job.findOne(filter).lean();
  if (!existing) {
    await Job.create(doc);
    return 'created';
  }
  await Job.updateOne(filter, { $set: doc });
  return 'updated';
}

async function processImportRun(job) {
  const connection = getConnection();
  const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);
  const logEntries = [];

  const feeds = await fetchAllFeeds();
  for (const feed of feeds) {
    const importLog = await ImportLog.create({ fileName: feed.url, totalFetched: feed.items.length });
    let newJobs = 0;
    let updatedJobs = 0;
    let failedJobs = 0;
    await Promise.all(
      feed.items.map(async (item) => {
        try {
          const result = await upsertJob(item);
          if (result === 'created') newJobs += 1;
          else updatedJobs += 1;
        } catch (err) {
          failedJobs += 1;
          await ImportLog.updateOne(
            { _id: importLog._id },
            { $push: { failures: { externalId: item.externalId || null, reason: err.message } } }
          );
        }
      })
    );
    const totalImported = newJobs + updatedJobs;
    await ImportLog.updateOne(
      { _id: importLog._id },
      { $set: { newJobs, updatedJobs, failedJobs, totalImported, completedAt: new Date() } }
    );
    logEntries.push(importLog._id);
  }
  return { logs: logEntries };
}

async function processJobUpsert(job) {
  const doc = job.data;
  return upsertJob(doc);
}

async function main() {
  await connectToDatabase();
  const queueName = process.env.QUEUE_NAME || 'job-import-queue';
  const workerConcurrency = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);
  const connection = getConnection();

  const worker = new Worker(
    queueName,
    async (job) => {
      if (job.name === 'import-run') {
        return processImportRun(job);
      }
      if (job.name === 'job-upsert') {
        return processJobUpsert(job);
      }
      return null;
    },
    { connection, concurrency: workerConcurrency }
  );

  worker.on('failed', (job, err) => {
    // eslint-disable-next-line no-console
    console.error('Job failed', job?.name, job?.id, err);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Worker fatal error', err);
  process.exit(1);
});


