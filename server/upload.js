const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
require('dotenv').config();

const router = express.Router();
let uploads = [];

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage (not disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// === Upload route ===
router.post('/', upload.single('photo'), async (req, res) => {
  const { caption } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).send();

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'photo-share' },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const newUpload = {
      url: result.secure_url,
      public_id: result.public_id,
      caption,
      user,
      time: new Date().toISOString()
    };
    uploads.push(newUpload);
    res.send({ success: true });
  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).send({ success: false });
  }
});

// === Get all uploads ===
router.get('/', (req, res) => {
  res.send(uploads);
});

// === Delete a photo (only if uploaded by current user) ===
router.post('/delete', async (req, res) => {
  const { url } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).send();

  const photo = uploads.find(p => p.url === url);
  if (!photo || photo.user !== user) {
    return res.status(403).send({ success: false, message: 'Not authorized' });
  }

  try {
    await cloudinary.uploader.destroy(photo.public_id);
    uploads = uploads.filter(p => p.url !== url);
    res.send({ success: true });
  } catch (err) {
    console.error('❌ Delete failed:', err);
    res.status(500).send({ success: false });
  }
});

module.exports = router;
