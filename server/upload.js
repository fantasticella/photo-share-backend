const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
require('dotenv').config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Route
router.post('/', upload.single('photo'), async (req, res) => {
  const { caption } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).send();

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'photo-share',
          context: {
            caption,
            user
          }
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
    console.error('❌ Upload error:', err);
    res.status(500).send({ success: false });
  }
});

// Fetch Images Route
router.get('/', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:photo-share')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const images = result.resources.map(item => ({
      url: item.secure_url,
      caption: item.context?.custom?.caption || '',
      user: item.context?.custom?.user || '',
      time: item.created_at
    }));

    res.send(images);
  } catch (err) {
    console.error('❌ Cloudinary fetch error:', err);
    res.status(500).send([]);
  }
});

module.exports = router;
