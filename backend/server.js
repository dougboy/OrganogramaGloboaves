const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
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

const organogramsDir = path.join(__dirname, 'public', 'organogramas');

const serveOrganogram = (req, res, next) => {
  const { slug } = req.params;
  if (!slug) return next();

  const slugDir = path.resolve(organogramsDir, slug);
  const relative = path.relative(organogramsDir, slugDir);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return res.status(404).send('Organograma não encontrado.');
  }

  const indexFile = path.join(slugDir, 'index.html');
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }

  return next();
};

app.get('/empresa/:slug', serveOrganogram);
app.get('/empresa/:slug/', serveOrganogram);

// Rotas principais
app.use(['/api', '/auth'], authRoutes);
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
