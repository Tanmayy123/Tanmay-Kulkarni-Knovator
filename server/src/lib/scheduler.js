const cron = require('node-cron');
const { enqueueImportRun } = require('../queue');

function scheduleCron() {
  const schedule = process.env.CRON_SCHEDULE || '0 * * * *';
  cron.schedule(schedule, async () => {
    try {
      await enqueueImportRun({ reason: 'cron' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Cron enqueue failed', err);
    }
  });
}

module.exports = { scheduleCron };


