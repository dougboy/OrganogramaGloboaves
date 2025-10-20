const path = require('path');
const fs = require('fs-extra');
const { create } = require('express-handlebars');

// Configuração do Handlebars (sem layout padrão)
const hbs = create({
  extname: '.handlebars',
  defaultLayout: false,
});

// Função que gera o estilo CSS do tema da empresa
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

// Copia logos e fotos para a pasta pública do organograma
const copyAssets = async (company, collaborators, targetDir) => {
  const assetsDir = path.join(targetDir, 'assets');
  await fs.ensureDir(assetsDir);

  // Copiar logotipo
  const logoFile = company.logo_path ? path.basename(company.logo_path) : null;
  let logoPublicPath = null;
  if (company.logo_path && (await fs.pathExists(company.logo_path))) {
    const logoDest = path.join(assetsDir, logoFile);
    await fs.copy(company.logo_path, logoDest);
    logoPublicPath = `assets/${logoFile}`;
  }

  // Copiar fotos dos colaboradores
  const collaboratorsWithAssets = await Promise.all(
    collaborators.map(async (col) => {
      if (!col.photo_path || !(await fs.pathExists(col.photo_path))) {
        return col;
      }
      const filename = path.basename(col.photo_path);
      const dest = path.join(assetsDir, filename);
      await fs.copy(col.photo_path, dest);
      return { ...col, photo_path: dest };
    })
  );

  return { logoPublicPath, collaborators: collaboratorsWithAssets };
};

// Gera o HTML completo do organograma
const generateOrganogram = async ({ company, collaborators, publicBase }) => {
  const slug = company.slug;
  const outputDir = path.join(__dirname, '..', 'public', 'organogramas', slug);

  await fs.ensureDir(outputDir);
  await fs.emptyDir(outputDir);

  // Copiar imagens para pasta pública
  const { logoPublicPath, collaborators: collaboratorsWithAssets } = await copyAssets(
    company,
    collaborators,
    outputDir
  );

  // Estrutura dos nós do organograma
  const nodes = collaboratorsWithAssets.map((col) => ({
    id: col.id,
    pid: col.manager_id || null,
    name: col.name,
    title: col.role,
    email: col.email,
    department: col.department,
    phone: col.phone,
    img: col.photo_path ? `assets/${path.basename(col.photo_path)}` : null,
  }));

  // Renderizar o template Handlebars
  const html = await hbs.renderView(
    path.join(__dirname, '..', 'views', 'organogram.handlebars'),
    {
      company: {
        ...company,
        logo_public_path: logoPublicPath,
        theme_style: normalizeTheme(company),
      },
      nodes: JSON.stringify(nodes),
    }
  );

  // Escrever o arquivo final
  await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf-8');

  // Construir URL pública final
  const base = (publicBase || process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  const normalizedUrl = base ? `${base}/empresa/${slug}` : `/empresa/${slug}`;

  return {
    slug,
    publicUrl: normalizedUrl,
  };
};

module.exports = {
  generateOrganogram,
};
