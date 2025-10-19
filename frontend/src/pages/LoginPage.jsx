import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await login(form);
    if (success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl shadow-slate-900/20 backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">OrgBuilder</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Acesso Administrativo</h1>
          <p className="mt-3 text-sm text-slate-500">Gerencie empresas, equipes e publique organogramas incríveis.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="username">
              Usuário
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Digite seu usuário"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Informe sua senha"
              required
            />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-soft transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
