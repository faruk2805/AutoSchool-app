const Payment = require('../models/Payment');
const User = require('../models/User');

// Admin unosi uplatu
exports.addPayment = async (req, res) => {
  try {
    const { userId, amount, purpose } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    const payment = await Payment.create({
      user: userId,
      amount,
      purpose
    });

    res.status(201).json({ message: 'Uplata dodana', payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Pregled uplata za kandidata
exports.getPayments = async (req, res) => {
  try {
    const userId = req.params.id;

    const payments = await Payment.find({ user: userId }).sort({ date: 1 });

    // Računanje ukupnog uplaćenog i dugovanja
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    // Pretpostavimo da je cijena obuke 1000 (može se staviti u env)
    const totalDue = 1300;
    const remaining = totalDue - totalPaid;

    res.json({
      payments,
      totalPaid,
      remaining
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
