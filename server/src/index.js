const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const { connectToDatabase } = require('./lib/db');
const { initializeQueues } = require('./queue');
const routes = require('./routes');
const { scheduleCron } = require('./lib/scheduler');

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.LOG_LEVEL || 'dev'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use('/api', routes);

async function bootstrap() {
  await connectToDatabase();
  await initializeQueues();
  scheduleCron();
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error', err);
  process.exit(1);
});


bootstrap();
