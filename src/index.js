require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth.routes');
const rideRoutes = require('./routes/ride.routes');
const registerSockets = require('./sockets');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/ride', rideRoutes);

const server = http.createServer(app);
const io = new Server(server);
registerSockets(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));