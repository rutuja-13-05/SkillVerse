const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/match', require('./routes/matchRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/notes', require('./routes/notesRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));

// Track online users: userId -> socketId
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Register user as online
  socket.on('user-connected', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log('User online:', userId);
  });

  // Join a chat room
  socket.on('join-chat', ({ chatId }) => {
    socket.join(chatId);
  });

  // Real-time message
  socket.on('send-message', (data) => {
    socket.to(data.chatId).emit('receive-message', data);

    // Also push real-time notification to receiver if they are online
    const receiverSocket = onlineUsers[data.receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit('new-notification', {
        type: 'New Message',
        content: `${data.senderName} sent you a message`,
        link: `/chat/${data.senderId}`,
      });
    }
  });

  // Typing indicator
  socket.on('typing', ({ chatId, userId }) => {
    socket.to(chatId).emit('user-typing', { userId });
  });

  // Send real-time notification (used when session is created etc.)
  socket.on('send-notification', ({ receiverId, notification }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit('new-notification', notification);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of Object.entries(onlineUsers)) {
      if (sockId === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
    console.log('Socket disconnected:', socket.id);
  });
});

// Export io so controllers can use it if needed
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });