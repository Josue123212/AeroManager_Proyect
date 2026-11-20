import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

interface AdminHeaderProps {
  children?: React.ReactNode;
}

export default function AdminHeader({ children }: AdminHeaderProps) {
  const navigate = useNavigate();
  const [utcTime, setUtcTime] = useState('');

  const storedUser = localStorage.getItem('aeromanager_user');
  const user = storedUser
    ? JSON.parse(storedUser)
    : { nombreCompleto: 'Josué Choque', rolActivo: 'Administrador' };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcTime(`UTC ${now.toISOString().slice(11, 19)}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aeromanager_token');
    localStorage.removeItem('aeromanager_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#18181B]">
      <AdminSidebar />
      <div className="pl-64">
        <header className="fixed top-0 left-64 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F5] border border-zinc-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-mono-code text-xs text-zinc-600">Neon Cloud DB:</span>
              <span className="font-mono-code text-xs font-bold text-emerald-700">Activo</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[#F4F4F5] border border-zinc-200 text-zinc-700 font-mono-code text-xs">
              <span className="material-symbols-outlined text-[15px] text-zinc-500">schedule</span>
              <span>{utcTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/operador/fids')}
              className="px-2.5 py-1 rounded bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition-colors cursor-pointer"
            >
              Ir a Consola Operador
            </button>
            <button
              type="button"
              onClick={() => navigate('/counter/cartelera')}
              className="px-2.5 py-1 rounded bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition-colors cursor-pointer"
            >
              Ir a Mostrador Counter
            </button>
            <div className="h-6 w-px bg-zinc-200"></div>
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-[#18181B] leading-tight">
                  {user.nombreCompleto}
                </span>
                <span className="text-[10px] font-bold uppercase text-[#0284C7]">
                  {user.rolActivo || 'Administrador'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Cambiar Rol / Cerrar Sesión"
                className="h-8 px-2.5 rounded bg-zinc-100 hover:bg-red-50 hover:text-red-600 border border-zinc-200 text-zinc-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </header>

        <main className="pt-20 px-6 pb-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
