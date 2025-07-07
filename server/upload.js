const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
require('dotenv').config();

const router = express.Router();

// ✅ Cloudinary config using .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🧠 In-memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// === POST /upload ===
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

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'photo-share',
          context: {
            caption: caption || '',
            user: user || '',
          },
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    console.log('✅ Cloudinary upload success:', result.secure_url);
    res.send({ success: true, url: result.secure_url });
  } catch (err) {
    console.error('❌ Cloudinary upload error:', err);
    res.status(500).send({ success: false });
  }
});

// === GET /upload ===
// Fetch list from Cloudinary (persistent)
router.get('/', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:photo-share')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const cloudUploads = result.resources.map(img => ({
      url: img.secure_url,
      caption: img.context?.custom?.caption || '',
      user: img.context?.custom?.user || '',
      time: img.created_at
    }));

    res.send(cloudUploads);
  } catch (err) {
    console.error('❌ Cloudinary fetch failed:', err);
    res.status(500).send({ success: false });
  }
});

module.exports = router;
