const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const testResultRoutes = require('./routes/testResultRoutes');
const questionRoutes = require('./routes/questionRoutes');
const examRoutes = require("./routes/examRoutes");
const path = require('path');
const mongoose = require('mongoose'); // DODAJ OVAJ IMPORT       
const drivingRoutes = require('./routes/drivingRoutes'); 
const vehicleRoutes = require('./routes/vehicleRoutes'); 

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
app.use('/api/profile', require('./routes/profileRoutes')); 
app.use('/api/badges', require('./routes/badgeRoutes'));
app.use('/api/badges', require('./routes/badgeRoutes'));    
app.use('/api/tests', require('./routes/tests'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/driving-times', require('./routes/drivingTimes'));
app.use('/api/chat', require('./routes/chatRoutes')); 
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/driving', require('./routes/drivingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/questions', questionRoutes);
app.use('/api/testresults', testResultRoutes);
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use("/api/exams", examRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/driving', drivingRoutes);

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
// Backend server.js - ISPRAVLJENA VERZIJA
io.on('connection', (socket) => {
  console.log('Korisnik povezan:', socket.id);
  
  const auth = socket.handshake.auth;
  console.log('Auth podaci:', auth);
  
  // POBOLJŠANO: Jednostavnija ekstrakcija user ID
  let userId = auth.user?._id || auth.user?.id || auth.userId || auth.id;
  
  console.log('Pronađen user ID:', userId);

  if (userId) {
    // Join user sobe
    socket.join(userId);
    console.log(`Korisnik ${userId} pridružen sobi`);
    
    // Join socket sobe za direktnu komunikaciju
    socket.join(socket.id);
  } else {
    console.log('Korisnik nema validan ID, koristim socket.id:', socket.id);
    userId = socket.id; // Fallback
    socket.join(socket.id);
  }

  // Join dodatne sobe
  socket.on('joinRoom', (roomId) => {
    if (roomId && roomId !== 'null' && roomId !== 'undefined') {
      socket.join(roomId);
      console.log(`Korisnik pridružen sobi ${roomId}`);
    }
  });

  // Slanje poruke - POBOLJŠANA VERZIJA
  socket.on('sendMessage', async (data) => {
    console.log('Primljena poruka:', data);
    
    if (!data.sender || !data.receiver) {
      console.log('Nevažeći podaci pri slanju poruke');
      return;
    }
    
    try {
      const message = await Message.create({
        sender: data.sender,
        receiver: data.receiver,
        content: data.content,
        type: data.type || 'text',
        image: data.image,
        isGroup: data.isGroup || false,
        status: 'sent'
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name surname role')
        .populate('receiver', 'name surname role');

      console.log('Poruka spremljena:', populatedMessage._id);

      // EMIT PORUKE - POBOLJŠANO
      // Pošalji primaocu
      io.to(data.receiver.toString()).emit('receiveMessage', populatedMessage);
      
      // Pošalji pošiljatelju (za sync)
      socket.emit('receiveMessage', populatedMessage);
      
      // Broadcast u grupu ako je grupni chat
      if (data.isGroup && data.room) {
        socket.to(data.room).emit('receiveMessage', populatedMessage);
      }
      
    } catch (error) {
      console.error('Greška pri slanju poruke:', error);
      socket.emit('messageError', { error: 'Greška pri slanju poruke' });
    }
  });

  // Novi event za označavanje poruka kao pročitane
  socket.on('markAsRead', async (data) => {
    try {
      await Message.updateMany(
        {
          receiver: data.userId,
          sender: data.otherUserId,
          status: { $ne: 'read' }
        },
        { status: 'read' }
      );
      
      // Obavijesti druge korisnike da su poruke pročitane
      socket.to(data.otherUserId).emit('messagesRead', {
        readerId: data.userId,
        conversationId: data.otherUserId
      });
      
    } catch (error) {
      console.error('Greška pri označavanju poruka:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Korisnik diskonektovan:', socket.id);
  });
});

// --------------------
// Pokretanje REST API servera
// --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌍 REST API server radi na portu ${PORT} i dostupan je u mreži`);
});