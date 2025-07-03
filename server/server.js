const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();

// Allow frontend to send cookies
app.use(cors({
  origin: 'https://photo-share-frontend-kappa.vercel.app', // your Vercel frontend
  credentials: true
}));

app.use(express.json());

//
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'none', // must be 'none' for cross-site
    secure: true      // must be true for HTTPS (Render is HTTPS)
  }
}));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./auth');
const uploadRoutes = require('./upload');
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);

//  Start server
app.listen(5000, () => console.log('Server running on port 5000'));
