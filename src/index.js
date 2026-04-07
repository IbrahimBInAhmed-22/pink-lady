require('dotenv').config();
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

app.use(express.json());
app.use((req, res, next) => {
  logger.info('http', `${req.method} ${req.originalUrl}`);
  next();
});

app.use('/auth', authRoutes);
app.use('/ride', rideRoutes);

const server = http.createServer(app);
const io = new Server(server);
registerSockets(io);

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

const PORT = process.env.PORT || 5000;

prisma
  .$connect()
  .then(() => {
    logger.info('prisma', 'Connected to database');
    server.listen(PORT, '0.0.0.0', () => {
      logger.info('server', `Listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('prisma', 'Failed to connect to database', err);
    process.exit(1);
  });

server.on('error', (err) => {
  logger.error('http-server', 'Server error', err);
});
