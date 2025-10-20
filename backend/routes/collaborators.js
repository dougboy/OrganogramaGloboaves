const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const collaboratorModel = require('../models/collaboratorModel');
const companyModel = require('../models/companyModel');

const router = express.Router({ mergeParams: true });

// Configuração de upload para fotos de colaboradores
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'photos'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage });

// 🔧 Função que resolve a URL pública conforme ambiente (local, Codespaces ou produção)
const resolvePublicBase = (req) => {
  const envBase = (process.env.PUBLIC_BASE_URL || '').trim();
  if (envBase) return envBase.replace(/\/$/, '');

  const host = req.get('host');
  if (!host) return '';

  const forwardedProto = req.get('x-forwarded-proto');
  const protocol = forwardedProto ? forwardedProto.split(',')[0] : req.protocol;

  return `${protocol}://${host}`.replace(/\/$/, '');
};

// 🔧 Monta a URL pública completa do arquivo
const buildPublicPath = (filePath, req) => {
  if (!filePath) return null;
  const relative = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');
  const baseUrl = resolvePublicBase(req);
  return baseUrl ? `${baseUrl}/${relative}` : `/${relative}`;
};

// 🔧 Serializa colaborador, incluindo URL completa da foto
const serializeCollaborator = (collaborator, req) => ({
  ...collaborator,
  photo_url: buildPublicPath(collaborator.photo_path, req),
});

// 📍 GET — Lista colaboradores de uma empresa
router.get('/', (req, res) => {
  const companyId = Number(req.params.companyId);
  const company = companyModel.findById(companyId);
  if (!company) return res.status(404).json({ message: 'Empresa não encontrada.' });

  const collaborators = collaboratorModel
    .findByCompany(companyId)
    .map((col) => serializeCollaborator(col, req));

  return res.json(collaborators);
});

// 📍 POST — Cria novo colaborador
router.post('/', upload.single('photo'), (req, res) => {
  try {
    const companyId = Number(req.params.companyId);
    const company = companyModel.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Empresa não encontrada.' });

    const { name, role, email, department, phone, managerId } = req.body;
    if (!name || !role) {
      return res.status(400).json({ message: 'Nome e cargo são obrigatórios.' });
    }

    if (managerId) {
      const manager = collaboratorModel.findById(Number(managerId));
      if (!manager || manager.company_id !== companyId) {
        return res.status(400).json({ message: 'Superior imediato inválido.' });
      }
    }

    const collaborator = collaboratorModel.create({
      companyId,
      name,
      role,
      email,
      department,
      phone,
      managerId: managerId ? Number(managerId) : null,
      photoPath: req.file ? req.file.path : null,
    });

    return res.status(201).json(serializeCollaborator(collaborator, req));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao cadastrar colaborador.' });
  }
});

// 📍 PUT — Atualiza colaborador existente
router.put('/:collaboratorId', upload.single('photo'), async (req, res) => {
  try {
    const companyId = Number(req.params.companyId);
    const collaboratorId = Number(req.params.collaboratorId);
    const collaborator = collaboratorModel.findById(collaboratorId);

    if (!collaborator || collaborator.company_id !== companyId) {
      return res.status(404).json({ message: 'Colaborador não encontrado.' });
    }

    const { name, role, email, department, phone, managerId } = req.body;

    if (managerId) {
      const manager = collaboratorModel.findById(Number(managerId));
      if (!manager || manager.company_id !== companyId || manager.id === collaboratorId) {
        return res.status(400).json({ message: 'Superior imediato inválido.' });
      }
    }

    let photoPath = collaborator.photo_path;
    if (req.file) {
      photoPath = req.file.path;
      if (collaborator.photo_path) {
        await fs.remove(collaborator.photo_path).catch(() => {});
      }
    }

    const updated = collaboratorModel.update(collaboratorId, {
      name: name || collaborator.name,
      role: role || collaborator.role,
      email,
      department,
      phone,
      managerId: managerId ? Number(managerId) : null,
      photoPath,
    });

    return res.json(serializeCollaborator(updated, req));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao atualizar colaborador.' });
  }
});

// 📍 DELETE — Remove colaborador
router.delete('/:collaboratorId', async (req, res) => {
  try {
    const companyId = Number(req.params.companyId);
    const collaboratorId = Number(req.params.collaboratorId);
    const collaborator = collaboratorModel.findById(collaboratorId);

    if (!collaborator || collaborator.company_id !== companyId) {
      return res.status(404).json({ message: 'Colaborador não encontrado.' });
    }

    if (collaborator.photo_path) {
      await fs.remove(collaborator.photo_path).catch(() => {});
    }

    collaboratorModel.remove(collaboratorId);
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao remover colaborador.' });
  }
});

module.exports = router;
