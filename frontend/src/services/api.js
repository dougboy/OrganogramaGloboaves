import axios from 'axios';

// Normaliza URLs removendo barras finais duplicadas e um sufixo "/api" isolado
const normalizeUrl = (rawUrl) => {
  if (!rawUrl) return rawUrl;

  const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

  try {
    const parsed = new URL(rawUrl);
    const pathname = trimTrailingSlash(parsed.pathname);
    // Remove o segmento final "/api" (com ou sem caminhos adicionais antes dele)
    const sanitizedPath = pathname.replace(/\/api$/i, '');
    parsed.pathname = sanitizedPath;
    return trimTrailingSlash(parsed.toString());
  } catch (error) {
    const trimmed = trimTrailingSlash(rawUrl);
    return trimTrailingSlash(trimmed.replace(/\/api$/i, ''));
  }
};

// Detecta automaticamente a base do backend
const resolveBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  // Quando não há janela (ex: SSR)
  if (typeof window === 'undefined') {
    return 'http://localhost:4000';
  }

  const { protocol, hostname, port } = window.location;
  const isIpv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);

  // Ambiente local
  if (hostname === 'localhost' || hostname === '127.0.0.1' || isIpv4) {
    return normalizeUrl(`${protocol}//${hostname}:4000`);
  }

  // GitHub Codespaces (ajuste dinâmico)
  const githubDevMatch = hostname.match(/^(.*)-(\d+)\.app\.github\.dev$/);
  if (githubDevMatch) {
    const [, prefix] = githubDevMatch;
    return normalizeUrl(`${protocol}//${prefix}-4000.app.github.dev`);
  }

  // Ajuste de portas não padrão
  if (port && !['80', '443'].includes(port)) {
    if (['5173', '4173'].includes(port)) {
      return normalizeUrl(`${protocol}//${hostname}:4000`);
    }
    return normalizeUrl(`${protocol}//${hostname}:${port}`);
  }

  // Fallback padrão
  return normalizeUrl(`${protocol}//${hostname}`);
};

// Base URL final (usada globalmente)
export const API_BASE_URL = resolveBaseURL();

// Criação da instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('orgbuilder_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Função de login
export const login = async (username, password) => {
  const response = await api.post('/api/login', { username, password });
  return response.data;
};

export default api;
