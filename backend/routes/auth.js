const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Função auxiliar para gerar o hash do password admin
const buildHash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// Configurações de autenticação
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'orgbuilder-secret';
const isBcryptHash = (value) => typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);

const PASSWORD_HASH = isBcryptHash(ADMIN_PASSWORD)
  ? ADMIN_PASSWORD
  : buildHash(ADMIN_PASSWORD);

// Rota de login
router.post('/login', (req, res) => {
  const rawUsername = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const rawPassword = typeof req.body.password === 'string' ? req.body.password : '';

  if (!rawUsername || !rawPassword) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
  }

  const normalizedUser = ADMIN_USER.trim();
  if (rawUsername !== normalizedUser) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  try {
    const isValid = bcrypt.compareSync(rawPassword, PASSWORD_HASH);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
  } catch (error) {
    console.error('Erro ao validar senha do administrador:', error);
    return res.status(500).json({ message: 'Erro ao validar credenciais.' });
  }

  const token = jwt.sign({ username: normalizedUser }, JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token });
});

module.exports = router;
