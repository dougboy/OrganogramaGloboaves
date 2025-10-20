const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicializa banco e dependências
require('./models/db');

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const collaboratorRoutes = require('./routes/collaborators');
const authenticate = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// 🔧 Permite que Express detecte corretamente HTTPS em proxies (ex: GitHub Codespaces, Vercel)
app.set('trust proxy', true);

// Middlewares principais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/organogramas', express.static(path.join(__dirname, 'public', 'organogramas')));
app.use('/empresa', express.static(path.join(__dirname, 'public', 'organogramas')));

// Rotas principais
app.use('/api', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/companies/:companyId/collaborators', authenticate, collaboratorRoutes);

// Endpoint de status
app.get('/', (req, res) => {
  res.json({ message: 'OrgBuilder API ativa.' });
});

// Middleware global de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro interno:', err);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
