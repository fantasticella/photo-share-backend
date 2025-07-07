const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const { uploads, saveUploads } = require('./uploads');
require('dotenv').config();

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage for Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// === Upload photo ===
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
    saveUploads();

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

// === Delete photo (no ownership check) ===
router.post('/delete', async (req, res) => {
  const { url } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).send();

  const index = uploads.findIndex(p => p.url === url);
  if (index === -1) {
    return res.status(404).send({ success: false, message: 'Photo not found' });
  }

  try {
    await cloudinary.uploader.destroy(uploads[index].public_id);
    uploads.splice(index, 1);
    saveUploads();
    res.send({ success: true });
  } catch (err) {
    console.error('❌ Delete failed:', err);
    res.status(500).send({ success: false });
  }
});

module.exports = router;
