module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('driver-location', (data) => {
      io.emit('update-location', data);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
    });
  });
};
