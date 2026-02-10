const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join_doctor_room', () => {
    socket.join('doctors');
    console.log('👨‍⚕️ Doctor joined room');
  });

  socket.on('new_ticket', (data) => {
    io.to('doctors').emit('new_patient', data);
    console.log('🎫 New ticket broadcasted:', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'ZYCARE Backend Running', timestamp: new Date() });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ZYCARE Backend running on port ${PORT}`);
  console.log(`📱 Mobile can connect at: http://192.168.137.14:${PORT}`);
});

module.exports = { io };
