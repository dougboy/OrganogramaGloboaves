const db = require('./db');

const findAll = () => {
  const stmt = db.prepare('SELECT * FROM companies ORDER BY name');
  return stmt.all();
};

const findById = (id) => {
  const stmt = db.prepare('SELECT * FROM companies WHERE id = ?');
  return stmt.get(id);
};

const findBySlug = (slug) => {
  const stmt = db.prepare('SELECT * FROM companies WHERE slug = ?');
  return stmt.get(slug);
};

const create = ({ name, cnpj, logoPath, description, themeType, themeValue, slug }) => {
  const stmt = db.prepare(`
    INSERT INTO companies (name, cnpj, logo_path, description, theme_type, theme_value, slug)
    VALUES (@name, @cnpj, @logo_path, @description, @theme_type, @theme_value, @slug)
  `);
  const info = stmt.run({
    name,
    cnpj,
    logo_path: logoPath,
    description,
    theme_type: themeType,
    theme_value: themeValue,
    slug
  });
  return findById(info.lastInsertRowid);
};

const update = (id, { name, cnpj, logoPath, description, themeType, themeValue, slug }) => {
  const existing = findById(id);
  if (!existing) return null;
  const stmt = db.prepare(`
    UPDATE companies
       SET name = @name,
           cnpj = @cnpj,
           logo_path = @logo_path,
           description = @description,
           theme_type = @theme_type,
           theme_value = @theme_value,
           slug = @slug
     WHERE id = @id
  `);
  stmt.run({
    id,
    name,
    cnpj,
    logo_path: logoPath ?? existing.logo_path,
    description,
    theme_type: themeType,
    theme_value: themeValue,
    slug
  });
  return findById(id);
};

const remove = (id) => {
  const stmt = db.prepare('DELETE FROM companies WHERE id = ?');
  return stmt.run(id);
};

module.exports = {
  findAll,
  findById,
  findBySlug,
  create,
  update,
  remove
};
