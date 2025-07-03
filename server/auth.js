const express = require('express');
const router = express.Router();

const USERS = {
  alice: 'pass123',
  bob: 'secret',
  carl: 'abc123'
};

// POST /auth/login
router.post('/login', (req, res) => {
  console.log('🟡 Login request received:', req.body);

  const { username, password } = req.body;

  if (!username || !password) {
    console.log('🔴 Missing username or password');
    return res.status(400).send({ success: false, message: 'Missing credentials' });
  }

  if (USERS[username] === password) {
    req.session.user = username;
    console.log('🟢 Login successful:', username);
    return res.send({ success: true });
  }

  console.log('🔴 Login failed: invalid credentials');
  res.status(401).send({ success: false, message: 'Invalid credentials' });
});

// GET /auth/me
router.get('/me', (req, res) => {
  console.log('🔵 Checking session:', req.session);

  if (req.session.user) {
    console.log('🟢 Session found, user:', req.session.user);
    res.send({ user: req.session.user });
  } else {
    console.log('🔴 No session found');
    res.status(401).send({});
  }
});

module.exports = router;
