const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null za grupni chat
  room: { type: String }, // opcionalno, za grupne sobe
  content: { type: String, required: true },
  isGroup: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'], 
    default: 'sent' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
