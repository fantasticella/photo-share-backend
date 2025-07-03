const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const DATA_FILE = path.join(__dirname, 'data.json');

// Load uploads from file (or empty array)
let uploads = [];
if (fs.existsSync(DATA_FILE)) {
  uploads = JSON.parse(fs.readFileSync(DATA_FILE));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST /upload
router.post('/', upload.single('photo'), (req, res) => {
  const { caption } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).send();

  const newUpload = {
    url: `/uploads/${req.file.filename}`,
    caption,
    user,
    time: new Date().toISOString()
  };

  uploads.push(newUpload);
  fs.writeFileSync(DATA_FILE, JSON.stringify(uploads, null, 2)); // save to file

  res.send({ success: true });
});

// GET /upload/all
router.get('/all', (req, res) => {
  res.send(uploads);
});

module.exports = router;
