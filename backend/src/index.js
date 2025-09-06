const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/polls');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join poll room
  socket.on('join-poll', (pollCode) => {
    socket.join(`poll-${pollCode}`);
    console.log(`User ${socket.id} joined poll ${pollCode}`);
  });

  // Leave poll room
  socket.on('leave-poll', (pollCode) => {
    socket.leave(`poll-${pollCode}`);
    console.log(`User ${socket.id} left poll ${pollCode}`);
  });

  // Handle new response
  socket.on('new-response', (data) => {
    const { pollCode, response } = data;
    socket.to(`poll-${pollCode}`).emit('response-received', response);
  });

  // Handle poll settings update
  socket.on('poll-settings-updated', (data) => {
    const { pollCode, settings } = data;
    socket.to(`poll-${pollCode}`).emit('settings-updated', settings);
  });

  // Handle poll status change
  socket.on('poll-status-changed', (data) => {
    const { pollCode, status } = data;
    socket.to(`poll-${pollCode}`).emit('status-changed', status);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export io for use in other modules
module.exports = { io };
