const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: { 
    type: String,
    default: null 
  }, // opcionalno, za grupne sobe
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 5000 
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  image: {
    url: String,
    filename: String,
    size: Number
  },
  file: {
    url: String,
    filename: String,
    size: Number,
    originalName: String
  },
  isGroup: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'], 
    default: 'sent' 
  },
  readAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

// Indexi za bolje performanse
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, status: 1 });
messageSchema.index({ room: 1 });
messageSchema.index({ createdAt: -1 });

// Middleware za automatsko postavljanje deliveredAt
messageSchema.pre('save', function(next) {
  if (this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  if (this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Virtual polje za konverzaciju ID (za grupisanje poruka)
messageSchema.virtual('conversationId').get(function() {
  if (this.isGroup && this.room) {
    return this.room;
  }
  // Za privatne razgovore, sortirani ID-ovi za konzistentnost
  const users = [this.sender.toString(), this.receiver.toString()].sort();
  return users.join('_');
});

// Metoda za označavanje poruke kao pročitane
messageSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Metoda za označavanje poruke kao isporučene
messageSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

// Statička metoda za dohvat nepročitanih poruka
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    receiver: userId,
    status: { $in: ['sent', 'delivered'] }
  });
};

// Statička metoda za označavanje konverzacije kao pročitane
messageSchema.statics.markConversationAsRead = function(senderId, receiverId) {
  return this.updateMany(
    {
      sender: senderId,
      receiver: receiverId,
      status: { $in: ['sent', 'delivered'] }
    },
    {
      status: 'read',
      readAt: new Date()
    }
  );
};

// Statička metoda za dohvat posljednje poruke u konverzaciji
messageSchema.statics.getLastMessage = function(user1Id, user2Id, isGroup = false, room = null) {
  const query = isGroup ? 
    { room, isGroup: true } : 
    {
      $or: [
        { sender: user1Id, receiver: user2Id },
        { sender: user2Id, receiver: user1Id }
      ],
      isGroup: false
    };

  return this.findOne(query)
    .sort({ createdAt: -1 })
    .populate('sender', 'name surname profileImage')
    .populate('receiver', 'name surname profileImage');
};

module.exports = mongoose.model('Message', messageSchema);