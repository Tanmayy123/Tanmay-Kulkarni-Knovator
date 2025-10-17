const express = require('express');
const ImportLog = require('../models/ImportLog');
const { enqueueImportRun } = require('../queue');

const router = express.Router();

router.post('/import/trigger', async (req, res) => {
  await enqueueImportRun({ reason: 'manual' });
  res.json({ enqueued: true });
});

router.get('/logs', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const logs = await ImportLog.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ logs });
});

module.exports = router;


