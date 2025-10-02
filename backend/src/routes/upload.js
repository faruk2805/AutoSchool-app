const express = require('express');
const router = express.Router();
const multer = require('multer');

// Gdje čuvamo slike i kako se zovu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Upload rute
router.post('/', upload.single('slika'), (req, res) => {
  res.json({ slika: `/uploads/${req.file.filename}` });
});

module.exports = router;
