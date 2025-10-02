const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Server radi 🚀');
});

// REST API routes
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/users', require('./routes/users'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/driving-times', require('./routes/drivingTimes'));
app.use('/api/users', require('./routes/profileRoutes'));
app.use('/api/chat', require('./routes/chatRoutes')); 
app.use('/api/users', require('./routes/badgeRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/driving-sessions', require('./routes/drivingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));


// --------------------
// Socket.IO server
// --------------------
const { Server } = require('socket.io');

// Pokrećemo Socket.IO server na portu 6000
const ioServerPort = 6000;
const io = new Server(ioServerPort, {
  cors: { origin: '*' },
});

console.log(`Socket.IO server radi na portu ${ioServerPort}`);

// Import Message model
const Message = require('./models/Message');

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Korisnik povezan:', socket.id);

  // Pridruživanje sobi korisnika
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`Korisnik ${userId} pridružen sobi`);
  });

  // Slanje poruke
  socket.on('sendMessage', async (data) => {
    /*
      data = {
        sender: userId,
        receiver: userId ili null za grupni chat,
        content: string,
        isGroup: boolean
      }
    */
    try {
      const message = await Message.create(data);

      if (data.isGroup) {
        io.emit('receiveMessage', message); // grupni chat
      } else {
        io.to(data.receiver).emit('receiveMessage', message); // primaoc
        io.to(data.sender).emit('receiveMessage', message);   // pošiljalac vidi poruku
      }
    } catch (err) {
      console.log('Greška pri slanju poruke:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Korisnik odspojen:', socket.id);
  });
});

// --------------------
// Pokretanje REST API servera
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`REST API server radi na portu ${PORT}`));
