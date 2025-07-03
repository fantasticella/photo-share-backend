const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();

// === CORS must be at top before routes ===
app.use(cors({
  origin: 'https://photo-share-frontend-kappa.vercel.app',
  credentials: true
}));

app.use(express.json());

// === SESSION (cookie setup) ===
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'none',
    secure: true
  }
}));

// === Static files (images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Routes
const authRoutes = require('./auth');
const uploadRoutes = require('./upload');

app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);

// === Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
