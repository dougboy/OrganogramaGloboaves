const path = require('path');
const fs = require('fs-extra');
const { create } = require('express-handlebars');

const hbs = create({
  layoutsDir: path.join(__dirname, '..', 'views', 'layouts'),
  partialsDir: path.join(__dirname, '..', 'views', 'partials'),
  extname: '.handlebars'
});

const normalizeTheme = (company) => {
  switch (company.theme_type) {
    case 'gradient':
      return `background: linear-gradient(${company.theme_value});`;
    case 'image':
      return `background: url('${company.theme_value}') center/cover no-repeat;`;
    default:
      return `background-color: ${company.theme_value || '#f8fafc'};`;
  }
};

const copyAssets = async (company, collaborators, targetDir) => {
  const assetsDir = path.join(targetDir, 'assets');
  await fs.ensureDir(assetsDir);
  const logoFile = company.logo_path ? path.basename(company.logo_path) : null;
  let logoPublicPath = null;
  if (company.logo_path && (await fs.pathExists(company.logo_path))) {
    const logoDest = path.join(assetsDir, logoFile);
    await fs.copy(company.logo_path, logoDest);
    logoPublicPath = `assets/${logoFile}`;
  }

  const collaboratorsWithAssets = await Promise.all(
    collaborators.map(async (col) => {
      if (!col.photo_path || !(await fs.pathExists(col.photo_path))) {
        return col;
      }
      const filename = path.basename(col.photo_path);
      const dest = path.join(assetsDir, filename);
      await fs.copy(col.photo_path, dest);
      return {
        ...col,
        photo_path: dest
      };
    })
  );

  return { logoPublicPath, collaborators: collaboratorsWithAssets };
};

const generateOrganogram = async ({ company, collaborators }) => {
  const slug = company.slug;
  const outputDir = path.join(__dirname, '..', 'public', 'organogramas', slug);
  await fs.ensureDir(outputDir);
  await fs.emptyDir(outputDir);

  const { logoPublicPath, collaborators: collaboratorsWithAssets } = await copyAssets(
    company,
    collaborators,
    outputDir
  );

  const nodes = collaboratorsWithAssets.map((col) => ({
    id: col.id,
    pid: col.manager_id || null,
    name: col.name,
    title: col.role,
    email: col.email,
    department: col.department,
    phone: col.phone,
    img: col.photo_path ? `assets/${path.basename(col.photo_path)}` : null
  }));

  const html = await hbs.renderView(path.join(__dirname, '..', 'views', 'organogram.handlebars'), {
    company: {
      ...company,
      logo_public_path: logoPublicPath,
      theme_style: normalizeTheme(company)
    },
    nodes: JSON.stringify(nodes)
  });

  await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf-8');

  const publicBase = process.env.PUBLIC_BASE_URL || '';
  const publicUrl = `${publicBase.replace(/\/$/, '')}/empresa/${slug}`;
  return {
    slug,
    publicUrl
  };
};

module.exports = {
  generateOrganogram
};
