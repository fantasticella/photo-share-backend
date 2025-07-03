const express = require('express');
const router = express.Router();

const USERS = {
  alice: 'pass123',
  bob: 'secret',
  carl: 'abc123'
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (USERS[username] === password) {
    req.session.user = username;
    return res.send({ success: true });
  }
  res.status(401).send({ success: false });
});

router.get('/me', (req, res) => {
  if (req.session.user) {
    res.send({ user: req.session.user });
  } else {
    res.status(401).send({});
  }
});

module.exports = router;
