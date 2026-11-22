import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const OPERATOR_ITEMS = [
  { label: 'Monitor FIDS en Vivo', icon: 'radar', path: '/operador/fids' },
  { label: 'Rutas Aéreas', icon: 'alt_route', path: '/operador/rutas' },
  { label: 'Programación de Vuelos', icon: 'flight_takeoff', path: '/operador/vuelos' },
  { label: 'Disponibilidad de Cabina', icon: 'airline_seat_recline_extra', path: '/operador/cabina' },
  { label: 'Monitor de Gates', icon: 'door_sliding', path: '/operador/gates' },
  { label: 'Flota Operativa', icon: 'flight', path: '/operador/flota' }
];

interface OperatorSidebarProps {
  children?: React.ReactNode;
}

export default function OperatorSidebar({ children }: OperatorSidebarProps) {
  const navigate = useNavigate();
  const [utcTime, setUtcTime] = useState('');

  const storedUser = localStorage.getItem('aeromanager_user');
  const user = storedUser
    ? JSON.parse(storedUser)
    : { nombreCompleto: 'Operador de Vuelos', rolActivo: 'Operador', roles: [] };
  const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
  const hasSuperAdmin = roles.some((r) => r.trim().toLowerCase() === 'superadmin');
  const hasAdmin = hasSuperAdmin || roles.some((r) => r.toLowerCase().includes('admin'));
  const hasCounter = hasSuperAdmin || roles.some((r) => r.toLowerCase().includes('counter'));

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
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#F4F4F5] border-r border-zinc-200 z-50 flex flex-col">
        <div className="h-16 px-4 flex items-center gap-2.5 bg-white border-b border-zinc-200">
          <img
            src="/logo.png"
            alt="AeroManager"
            className="w-8 h-8 rounded object-cover"
          />
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#18181B] leading-tight">AeroManager</span>
            <span className="text-[10px] font-bold text-[#0284C7] uppercase tracking-wider">
              Operations Suite
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-2">
          <div className="px-2.5 mb-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Torre &amp; Despacho de Vuelos
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {OPERATOR_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded text-xs transition-all ${
                    isActive
                      ? 'bg-[#0284C7] text-white font-semibold shadow-2xs'
                      : 'text-zinc-700 hover:bg-zinc-200/70 hover:text-[#18181B]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-2.5 bg-white border-t border-zinc-200">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#F4F4F5]">
            <span className="text-[11px] font-semibold text-zinc-600">Control de Operaciones</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          </div>
        </div>
      </aside>

      <div className="pl-64">
        <header className="fixed top-0 left-64 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#F4F4F5] border border-zinc-200 text-zinc-700 font-mono-code text-xs">
              <span className="material-symbols-outlined text-[15px] text-zinc-500">schedule</span>
              <span>{utcTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasSuperAdmin && (
              <button
                type="button"
                onClick={() => navigate('/superadmin/ver/operador/fids')}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">exit_to_app</span>
                <span>Salir de vista Operador</span>
              </button>
            )}
            {!hasSuperAdmin && hasAdmin && (
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="px-2.5 py-1 rounded bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition-colors cursor-pointer"
              >
                Consola Admin
              </button>
            )}
            {!hasSuperAdmin && hasCounter && (
              <button
                type="button"
                onClick={() => navigate('/counter/cartelera')}
                className="px-2.5 py-1 rounded bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition-colors cursor-pointer"
              >
                Mostrador Counter
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-[#18181B] leading-tight">
                  {user.nombreCompleto}
                </span>
                <span className="text-[10px] font-bold uppercase text-[#0284C7]">
                  OPERADOR DE VUELOS
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
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
