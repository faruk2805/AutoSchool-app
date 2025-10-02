const Message = require('../models/Message');

// Nova poruka
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, isGroup, room } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      receiver: isGroup ? null : receiverId,
      content,
      isGroup: isGroup || false,
      room: isGroup ? room || 'default' : null,
      status: 'sent'
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dohvat poruka za korisnika ili grupu
exports.getMessages = async (req, res) => {
  try {
    const { userId, room } = req.params;

    let query;

    if (room) {
      // Dohvati poruke iz određene sobe (grupni chat)
      query = { room };
    } else {
      // Privatne poruke + grupne poruke
      query = {
        $or: [
          { sender: userId },
          { receiver: userId },
          { isGroup: true }
        ]
      };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update statusa poruke (npr. read)
exports.updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['sent', 'delivered', 'read'].includes(status)) {
      return res.status(400).json({ message: 'Nevažeći status' });
    }

    const message = await Message.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
