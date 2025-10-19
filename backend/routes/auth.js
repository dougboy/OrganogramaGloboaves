const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const buildHash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'orgbuilder-secret';
const PASSWORD_HASH = buildHash(ADMIN_PASSWORD);

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USER) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }
  const isValid = bcrypt.compareSync(password, PASSWORD_HASH);
  if (!isValid) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token });
});

module.exports = router;
