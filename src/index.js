require('dotenv').config({ quiet: true });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const logger = require('./lib/logger');
const authRoutes = require('./routes/auth.routes');
const rideRoutes = require('./routes/ride.routes');
const registerSockets = require('./sockets');
const prisma = require('./lib/prisma');

process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    'process',
    'unhandledRejection',
    reason instanceof Error ? reason : new Error(String(reason))
  );
});

process.on('uncaughtException', (err) => {
  logger.error('process', 'uncaughtException', err);
  process.exit(1);
});

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(express.json());
app.use((req, res, next) => {
  logger.info('http', `${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});
app.get('/', (_req, res) => {
  res.redirect(302, '/health');
});

app.use('/auth', authRoutes);
app.use('/ride', rideRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, _next) => {
  logger.error('express', err.message || 'Request failed', err);
  const status = Number(err.status) || 500;
  const body =
    process.env.NODE_ENV === 'production' && status === 500
      ? { error: 'Internal server error' }
      : { error: err.message || 'Internal server error' };
  res.status(status).json(body);
});

const parsedPort = parseInt(process.env.PORT, 10);
const PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 8080;

setInterval(() => {
  logger.info('heartbeat', 'Process alive', { uptime: process.uptime() });
}, 30000);

let server;
try {
  server = http.createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 },
  });
  registerSockets(io);
} catch (err) {
  logger.error('startup', 'Failed to initialize server', err);
  process.exit(1);
}

server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

server.on('error', (err) => {
  logger.error('http-server', 'Server error', err);
});

async function shutdown(signal) {
  logger.warn('process', `Received ${signal}, shutting down`);
  try {
    if (server && server.listening) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await prisma.$disconnect();
    logger.info('process', 'Shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error('process', 'Error during shutdown', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

prisma
  .$connect()
  .then(() => {
    logger.info('prisma', 'Connected to database');
    logger.info('server', 'Startup bind config', {
      port: PORT,
      portEnv: process.env.PORT ?? null,
      railway: process.env.RAILWAY_ENVIRONMENT ?? null,
    });
    server.listen(PORT, '0.0.0.0', () => {
      logger.info('server', `Listening on 0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('prisma', 'Failed to connect to database', err);
    process.exit(1);
  });
