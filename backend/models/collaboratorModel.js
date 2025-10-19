const db = require('./db');

const findByCompany = (companyId) => {
  const stmt = db.prepare('SELECT * FROM collaborators WHERE company_id = ? ORDER BY name');
  return stmt.all(companyId);
};

const findById = (id) => {
  const stmt = db.prepare('SELECT * FROM collaborators WHERE id = ?');
  return stmt.get(id);
};

const create = ({ companyId, name, role, email, department, phone, managerId, photoPath }) => {
  const stmt = db.prepare(`
    INSERT INTO collaborators (company_id, name, role, email, department, phone, manager_id, photo_path)
    VALUES (@company_id, @name, @role, @email, @department, @phone, @manager_id, @photo_path)
  `);
  const info = stmt.run({
    company_id: companyId,
    name,
    role,
    email,
    department,
    phone,
    manager_id: managerId || null,
    photo_path: photoPath
  });
  return findById(info.lastInsertRowid);
};

const update = (id, { name, role, email, department, phone, managerId, photoPath }) => {
  const existing = findById(id);
  if (!existing) return null;
  const stmt = db.prepare(`
    UPDATE collaborators
       SET name = @name,
           role = @role,
           email = @email,
           department = @department,
           phone = @phone,
           manager_id = @manager_id,
           photo_path = @photo_path,
           updated_at = CURRENT_TIMESTAMP
     WHERE id = @id
  `);
  stmt.run({
    id,
    name,
    role,
    email,
    department,
    phone,
    manager_id: managerId || null,
    photo_path: photoPath ?? existing.photo_path
  });
  return findById(id);
};

const remove = (id) => {
  const stmt = db.prepare('DELETE FROM collaborators WHERE id = ?');
  return stmt.run(id);
};

module.exports = {
  findByCompany,
  findById,
  create,
  update,
  remove
};
