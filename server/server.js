const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();
app.use(cors({ origin: 'https://photo-share-frontend-kappa.vercel.app', credentials: true }));
app.use(express.json());
app.use(session({ secret: 'mysecret', resave: false, saveUninitialized: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./auth');
const uploadRoutes = require('./upload');
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
