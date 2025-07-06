const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
require('dotenv').config();

const router = express.Router();
let uploads = [];

// Cloudinary config from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Use memory storage (not disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
      caption,
      user,
      time: new Date().toISOString()
    };
    uploads.push(newUpload);
    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false });
  }
});

router.get('/', (req, res) => {
  res.send(uploads);
});

module.exports = router;
