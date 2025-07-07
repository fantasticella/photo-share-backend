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

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('photo'), async (req, res) => {
  const { caption } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).send();

  console.log('🟡 Upload route hit:', {
    user,
    caption,
    hasFile: !!req.file,
    fileSize: req.file?.buffer?.length,
  });

  if (!req.file || !req.file.buffer) {
    console.error('❌ No file buffer received');
    return res.status(400).send({ success: false, error: 'No file received' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'photo-share' },
        (err, result) => {
          if (err) {
            console.error('❌ Cloudinary upload error:', err);
            return reject(err);
          }
          console.log('✅ Cloudinary upload success:', result.secure_url);
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
    console.error('❌ Upload failed:', err);
    res.status(500).send({ success: false, error: 'Upload failed' });
  }
});

router.get('/', (req, res) => {
  res.send(uploads);
});

module.exports = router;
