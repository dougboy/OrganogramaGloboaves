const jwt = require('jsonwebtoken');

// Segredo JWT com fallback seguro
const JWT_SECRET = process.env.JWT_SECRET || 'orgbuilder-secret';

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.replace('Bearer ', '') : null;

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
};

module.exports = authenticate;
