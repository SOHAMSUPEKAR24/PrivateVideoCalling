const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create an Express application
const app = express();

// Create an HTTP server with the Express app
const server = http.createServer(app);

// Initialize Socket.io with the server
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle video offer
    socket.on('video-offer', (offer) => {
        socket.broadcast.emit('video-offer', offer);
    });

    // Handle video answer
    socket.on('video-answer', (answer) => {
        socket.broadcast.emit('video-answer', answer);
    });

    // Handle ICE candidate
    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Set the port for the server, using environment variable if available
const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
