const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./models/db');

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const collaboratorRoutes = require('./routes/collaborators');
const authenticate = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/organogramas', express.static(path.join(__dirname, 'public', 'organogramas')));
app.use('/empresa', express.static(path.join(__dirname, 'public', 'organogramas')));

app.use('/api', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/companies/:companyId/collaborators', authenticate, collaboratorRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'OrgBuilder API ativa.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
