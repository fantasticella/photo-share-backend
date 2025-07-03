const express = require('express');
const multer = require('multer');
const router = express.Router();

let uploads = [];

const storage = multer.diskStorage({
  destination: 'server/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

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
  res.send({ success: true });
});

router.get('/', (req, res) => {
  res.send(uploads);
});

module.exports = router;
