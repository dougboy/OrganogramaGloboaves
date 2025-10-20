import axios from 'axios';

const normalizeUrl = (url) => url.replace(/\/$/, '');

const resolveBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:4000';
  }

  const { protocol, hostname, port } = window.location;

  const isIpv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);

  if (hostname === 'localhost' || hostname === '127.0.0.1' || isIpv4) {
    return normalizeUrl(`${protocol}//${hostname}:4000`);
  }

  const githubDevMatch = hostname.match(/^(.*)-(\d+)\.app\.github\.dev$/);
  if (githubDevMatch) {
    const [, prefix] = githubDevMatch;
    return normalizeUrl(`${protocol}//${prefix}-4000.app.github.dev`);
  }

  if (port && !['80', '443'].includes(port)) {
    if (['5173', '4173'].includes(port)) {
      return normalizeUrl(`${protocol}//${hostname}:4000`);
    }
    return normalizeUrl(`${protocol}//${hostname}:${port}`);
  }

  return normalizeUrl(`${protocol}//${hostname}`);
};

export const API_BASE_URL = resolveBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('orgbuilder_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  const response = await api.post('/api/login', { username, password });
  return response.data;
};

export default api;
