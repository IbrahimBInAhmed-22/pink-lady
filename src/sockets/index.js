const logger = require('../lib/logger');

module.exports = (io) => {
  io.engine.on('connection_error', (err) => {
    logger.error('socket.io-engine', 'Connection error', err);
  });

  io.on('connection', (socket) => {
    logger.info('socket', `Client connected: ${socket.id}`);

    socket.on('error', (err) => {
      logger.error('socket', `Socket error (${socket.id})`, err);
    });

    socket.on('driver-location', (data) => {
      try {
        io.emit('update-location', data);
      } catch (err) {
        logger.error('socket.driver-location', `Handler failed (${socket.id})`, err);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info('socket', `Disconnected: ${socket.id}`, { reason });
    });
  });
};
