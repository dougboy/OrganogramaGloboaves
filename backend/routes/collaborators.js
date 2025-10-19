const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const collaboratorModel = require('../models/collaboratorModel');
const companyModel = require('../models/companyModel');

const router = express.Router({ mergeParams: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'photos'));
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

const serializeCollaborator = (collaborator) => ({
  ...collaborator,
  photo_url: buildPublicPath(collaborator.photo_path),
});

router.get('/', (req, res) => {
  const companyId = Number(req.params.companyId);
  const company = companyModel.findById(companyId);
  if (!company) {
    return res.status(404).json({ message: 'Empresa não encontrada.' });
  }
  const collaborators = collaboratorModel.findByCompany(companyId).map(serializeCollaborator);
  return res.json(collaborators);
});

router.post('/', upload.single('photo'), (req, res) => {
  try {
    const companyId = Number(req.params.companyId);
    const company = companyModel.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada.' });
    }
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
    const collaborator = serializeCollaborator(
      collaboratorModel.create({
      companyId,
      name,
      role,
      email,
      department,
      phone,
      managerId: managerId ? Number(managerId) : null,
      photoPath: req.file ? req.file.path : null
      })
    );
    return res.status(201).json(collaborator);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao cadastrar colaborador.' });
  }
});

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
    const updated = serializeCollaborator(
      collaboratorModel.update(collaboratorId, {
      name: name || collaborator.name,
      role: role || collaborator.role,
      email,
      department,
      phone,
      managerId: managerId ? Number(managerId) : null,
      photoPath
    })
    );
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao atualizar colaborador.' });
  }
});

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
