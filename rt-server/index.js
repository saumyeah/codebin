const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);


  socket.on('join-room', (snippetId) => {

    socket.join(snippetId);
    console.log(`User ${socket.id} joined room ${snippetId}`);
  });

  
  socket.on('code-change', (data) => {
    const { room, newCode } = data;

    socket.broadcast.to(room).emit('receive-change', newCode);
  });


  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 8081;
server.listen(PORT, () => {
  console.log(`Real-Time Server (Phone Call) is running on http://localhost:${PORT}`);
});
