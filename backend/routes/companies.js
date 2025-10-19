const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const slugify = require('slugify');

const companyModel = require('../models/companyModel');
const collaboratorModel = require('../models/collaboratorModel');
const authenticate = require('../middleware/auth');
const { generateOrganogram } = require('../services/organogramService');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'logos'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });

const buildPublicPath = (filePath) => {
  if (!filePath) return null;
  const relative = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');
  const baseUrl = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  return `${baseUrl}/${relative}`;
};

const serializeCompany = (company) => {
  if (!company) return null;
  return {
    ...company,
    logo_url: buildPublicPath(company.logo_path),
  };
};

const serializeCollaborator = (collaborator) => ({
  ...collaborator,
  photo_url: buildPublicPath(collaborator.photo_path),
});

const buildUniqueSlug = (name, currentId = null) => {
  const baseSlug = slugify(name || 'empresa', { lower: true, strict: true }) || `empresa-${Date.now()}`;
  let candidate = baseSlug;
  let suffix = 1;
  while (true) {
    const existing = companyModel.findBySlug(candidate);
    if (!existing || existing.id === currentId) {
      break;
    }
    candidate = `${baseSlug}-${suffix++}`;
  }
  return candidate;
};

router.use(authenticate);

router.get('/', (req, res) => {
  const companies = companyModel.findAll().map(serializeCompany);
  return res.json(companies);
});

router.get('/:id', (req, res) => {
  const company = companyModel.findById(req.params.id);
  if (!company) {
    return res.status(404).json({ message: 'Empresa não encontrada.' });
  }
  const collaborators = collaboratorModel.findByCompany(company.id).map(serializeCollaborator);
  return res.json({ ...serializeCompany(company), collaborators });
});

router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const { name, cnpj, description, themeType, themeValue } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Nome é obrigatório.' });
    }
    const slug = buildUniqueSlug(name);
    const company = serializeCompany(
      companyModel.create({
      name,
      cnpj,
      description,
      themeType,
      themeValue,
      logoPath: req.file ? req.file.path : null,
      slug
      })
    );
    return res.status(201).json(company);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao criar empresa.' });
  }
});

router.put('/:id', upload.single('logo'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = companyModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Empresa não encontrada.' });
    }
    const { name, cnpj, description, themeType, themeValue } = req.body;
    const slug = buildUniqueSlug(name || existing.name, id);
    let logoPath = existing.logo_path;
    if (req.file) {
      logoPath = req.file.path;
      if (existing.logo_path) {
        await fs.remove(existing.logo_path).catch(() => {});
      }
    }
    const updated = serializeCompany(
      companyModel.update(id, {
      name: name || existing.name,
      cnpj,
      description,
      themeType: themeType || existing.theme_type,
      themeValue: themeValue || existing.theme_value,
      logoPath,
      slug
      })
    );
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao atualizar empresa.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = companyModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Empresa não encontrada.' });
    }
    if (existing.logo_path) {
      await fs.remove(existing.logo_path).catch(() => {});
    }
    companyModel.remove(id);
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao remover empresa.' });
  }
});

router.post('/:id/generate', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const company = companyModel.findById(id);
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada.' });
    }
    const collaborators = collaboratorModel.findByCompany(company.id);
    const { publicUrl } = await generateOrganogram({ company, collaborators });
    return res.json({ message: 'Organograma gerado com sucesso!', url: publicUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao gerar organograma.' });
  }
});

module.exports = router;
