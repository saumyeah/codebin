const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:["https://codebin-smoky.vercel.app", "http://localhost:5173"],// Allow our React app
    methods: ["GET", "POST"]
  }
});

// This runs for EVERY user that connects to this server
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // 1. Listen for a "join-room" event from the client
  socket.on('join-room', (snippetId) => {
    // Put this user's socket into a "room"
    // named after the snippet ID.
    socket.join(snippetId);
    console.log(`User ${socket.id} joined room ${snippetId}`);
  });

  // 2. Listen for a "code-change" event
  socket.on('code-change', (data) => {
    const { room, newCode } = data;
    // Broadcast this change to *everyone else* in the room
    socket.broadcast.to(room).emit('receive-change', newCode);
  });

  // 3. Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Run this server on a DIFFERENT port
const PORT = 8081;
server.listen(PORT, () => {
  console.log(`Real-Time Server (Phone Call) is running on http://localhost:${PORT}`);
});