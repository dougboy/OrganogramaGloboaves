import { Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const AppLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100/70">
      <header className="sticky top-0 z-30 backdrop-blur border-b border-slate-200/60 bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">OrgBuilder</p>
            <h1 className="font-semibold text-slate-900 text-xl">Painel Administrativo</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-slate-700"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto min-h-[calc(100vh-88px)] w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
