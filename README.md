# OrgBuilder

Aplicação completa para construção, gestão e publicação de organogramas corporativos com área administrativa moderna e página pública compartilhável.

## Visão geral

O projeto é dividido em dois pacotes independentes:

- **backend/** – API REST em Node.js + Express com banco SQLite, upload de mídias, geração de páginas estáticas e autenticação via token.
- **frontend/** – SPA em React + TailwindCSS para administração de empresas, colaboradores e pré-visualização do organograma.

As páginas públicas geradas são exportadas como HTML responsivo e ficam disponíveis em `/empresa/{slug-da-empresa}`.

## Requisitos

- Node.js 18+
- npm 9+

## Configuração

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Valores padrão de acesso:

- Usuário: `admin`
- Senha: `admin123`

A API será iniciada em `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

A interface administrativa fica disponível em `http://localhost:5173` (ou porta informada pelo Vite).

## Principais funcionalidades

- Login protegido com token JWT.
- Cadastro e edição de empresas com logotipo, descrição, CNPJ e configuração de tema (cor, gradiente ou imagem).
- Upload de fotos de colaboradores, definição de gestores e metadados (e-mail, departamento, telefone).
- Pré-visualização do organograma na própria área administrativa.
- Geração automática de página pública estática com imagem de capa, cards com foto circular e botões para exportar PDF ou PNG.
- Armazenamento dos uploads em disco e replicação das mídias para a versão pública do organograma.

## Estrutura de diretórios

```
orgbuilder/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   └── views/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── public/
└── public/
    └── organogramas/
```

## Geração do organograma público

1. Cadastre a empresa e sua equipe pela interface administrativa.
2. Clique em **“Gerar organograma público”**.
3. O HTML é criado em `backend/public/organogramas/{slug}/index.html` e pode ser acessado via `http://localhost:4000/empresa/{slug}`.
4. O visitante consegue exportar a visualização como PDF ou imagem.

## Scripts úteis

### Backend

- `npm run dev` – inicia a API em modo desenvolvimento (Nodemon).
- `npm start` – inicia a API em produção.

### Frontend

- `npm run dev` – executa o Vite em modo desenvolvimento.
- `npm run build` – gera a versão otimizada para produção.
- `npm run preview` – pré-visualiza o build de produção.

## Licença

Projeto desenvolvido como referência acadêmica e pode ser adaptado para diferentes contextos empresariais.
