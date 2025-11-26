const Message = require('../models/Message');
const User = require('../models/User');

// Nova poruka
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content, isGroup = false, type = 'text', image } = req.body;
    const sender = req.user._id;

    // Validacija
    if (!receiver || !content) {
      return res.status(400).json({ 
        message: 'Primaoc i sadržaj poruke su obavezni' 
      });
    }

    const message = await Message.create({
      sender,
      receiver,
      content,
      isGroup,
      type,
      image,
      status: 'sent'
    });

    // Populiraj podatke o pošiljatelju i primaocu
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name surname email role profileImage')
      .populate('receiver', 'name surname email role profileImage');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      message: 'Greška pri slanju poruke', 
      error: error.message 
    });
  }
};

// Dohvat poruka između dva korisnika
exports.getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Validacija
    if (!userId) {
      return res.status(400).json({ 
        message: 'ID korisnika je obavezan' 
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name surname email role profileImage')
    .populate('receiver', 'name surname email role profileImage')
    .sort({ createdAt: 1 });

    // Označi poruke kao pročitane kada ih korisnik dohvati
    await Message.updateMany(
      {
        receiver: currentUserId,
        sender: userId,
        status: 'sent'
      },
      { status: 'delivered' }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      message: 'Greška pri dohvatanju poruka', 
      error: error.message 
    });
  }
};

// Dohvat svih konverzacija za trenutnog korisnika
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Pronađi sve jedinstvene korisnike s kojima je trenutni korisnik razgovarao
    const messages = await Message.find({
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId }
      ]
    })
    .populate('sender', 'name surname email role profileImage')
    .populate('receiver', 'name surname email role profileImage')
    .sort({ createdAt: -1 });

    // Grupiraj poruke po konverzacijama
    const conversationsMap = new Map();

    messages.forEach(message => {
      const otherUser = 
        message.sender._id.toString() === currentUserId.toString() 
          ? message.receiver 
          : message.sender;

      const conversationKey = otherUser._id.toString();

      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
          lastMessageTime: message.createdAt
        });
      }
    });

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ 
      message: 'Greška pri dohvatanju konverzacija', 
      error: error.message 
    });
  }
};

// Dohvat kandidata za instruktora
exports.getCandidates = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Za instruktora - dohvati sve kandidate koji su mu dodijeljeni
    if (req.user.role === 'instructor') {
      const candidates = await User.find({ 
        role: 'candidate',
        instruktor: currentUserId 
      }).select('name surname email role profileImage');

      // Dohvati posljednje poruke za svakog kandidata
      const candidatesWithLastMessage = await Promise.all(
        candidates.map(async (candidate) => {
          const lastMessage = await Message.findOne({
            $or: [
              { sender: currentUserId, receiver: candidate._id },
              { sender: candidate._id, receiver: currentUserId }
            ]
          })
          .sort({ createdAt: -1 })
          .populate('sender', 'name surname profileImage')
          .populate('receiver', 'name surname profileImage');

          // Broj nepročitanih poruka
          const unreadCount = await Message.countDocuments({
            sender: candidate._id,
            receiver: currentUserId,
            status: { $in: ['sent', 'delivered'] }
          });

          return {
            _id: candidate._id,
            name: candidate.name,
            surname: candidate.surname,
            email: candidate.email,
            role: candidate.role,
            profileImage: candidate.profileImage,
            lastMessage: lastMessage?.content || 'Nema poruka',
            lastMessageTime: lastMessage?.createdAt || null,
            unreadCount,
            hasUnread: unreadCount > 0,
            lastMessageType: lastMessage?.type || 'text'
          };
        })
      );

      // Sortiraj po posljednjoj poruci (najnovije prvo)
      candidatesWithLastMessage.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
        return timeB - timeA;
      });

      res.json(candidatesWithLastMessage);
    } else {
      // Za kandidate - dohvati njihovog instruktora
      const candidate = await User.findById(currentUserId)
        .populate('instruktor', 'name surname email role profileImage');
      
      if (candidate && candidate.instruktor) {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: currentUserId, receiver: candidate.instruktor._id },
            { sender: candidate.instruktor._id, receiver: currentUserId }
          ]
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'name surname profileImage')
        .populate('receiver', 'name surname profileImage');

        // Broj nepročitanih poruka za kandidata
        const unreadCount = await Message.countDocuments({
          sender: candidate.instruktor._id,
          receiver: currentUserId,
          status: { $in: ['sent', 'delivered'] }
        });

        const instructorWithLastMessage = {
          _id: candidate.instruktor._id,
          name: candidate.instruktor.name,
          surname: candidate.instruktor.surname,
          email: candidate.instruktor.email,
          role: candidate.instruktor.role,
          profileImage: candidate.instruktor.profileImage,
          lastMessage: lastMessage?.content || 'Nema poruka',
          lastMessageTime: lastMessage?.createdAt || null,
          unreadCount,
          hasUnread: unreadCount > 0,
          lastMessageType: lastMessage?.type || 'text'
        };

        res.json([instructorWithLastMessage]);
      } else {
        res.json([]);
      }
    }
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ 
      message: 'Greška pri dohvatanju kandidata', 
      error: error.message 
    });
  }
};

// Update statusa poruke
exports.updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validacija statusa
    const validStatuses = ['sent', 'delivered', 'read'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Nevažeći status poruke' 
      });
    }

    const message = await Message.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
    .populate('sender', 'name surname email role profileImage')
    .populate('receiver', 'name surname email role profileImage');

    if (!message) {
      return res.status(404).json({ 
        message: 'Poruka nije pronađena' 
      });
    }

    res.json(message);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ 
      message: 'Greška pri ažuriranju statusa poruke', 
      error: error.message 
    });
  }
};

// Oznaci sve poruke od određenog korisnika kao pročitane
exports.markConversationAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ 
        message: 'ID korisnika je obavezan' 
      });
    }

    const result = await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        status: { $in: ['sent', 'delivered'] }
      },
      { status: 'read' }
    );

    res.json({
      message: `Označeno ${result.modifiedCount} poruka kao pročitano`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ 
      message: 'Greška pri označavanju konverzacije kao pročitane', 
      error: error.message 
    });
  }
};

// Broj nepročitanih poruka
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const unreadCount = await Message.countDocuments({
      receiver: currentUserId,
      status: { $in: ['sent', 'delivered'] }
    });
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ 
      message: 'Greška pri dohvatanju broja nepročitanih poruka', 
      error: error.message 
    });
  }
};

// Dohvati posljednje poruke za sve konverzacije
exports.getLastMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", currentUserId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", currentUserId] },
                    { $in: ["$status", ["sent", "delivered"]] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            surname: "$user.surname",
            email: "$user.email",
            role: "$user.role",
            profileImage: "$user.profileImage"
          },
          lastMessage: {
            content: "$lastMessage.content",
            type: "$lastMessage.type",
            createdAt: "$lastMessage.createdAt",
            status: "$lastMessage.status"
          },
          unreadCount: 1,
          hasUnread: { $gt: ["$unreadCount", 0] }
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    res.json(lastMessages);
  } catch (error) {
    console.error('Error fetching last messages:', error);
    res.status(500).json({ 
      message: 'Greška pri dohvatanju posljednjih poruka', 
      error: error.message 
    });
  }
};