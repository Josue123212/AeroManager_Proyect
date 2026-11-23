import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const COUNTER_TABS = [
  { label: '1. Cartelera de Vuelos', icon: 'flight_takeoff', path: '/counter/cartelera' },
  { label: '2. Mapa de Cabina y Reserva', icon: 'airline_seat_recline_normal', path: '/counter/cabina' },
  { label: '3. Padrón de Pasajeros', icon: 'groups', path: '/counter/pasajeros' },
  { label: '4. Tickets Emitidos', icon: 'confirmation_number', path: '/counter/tickets' }
];

interface CounterNavbarProps {
  children?: React.ReactNode;
}

export default function CounterNavbar({ children }: CounterNavbarProps) {
  const navigate = useNavigate();
  const [utcTime, setUtcTime] = useState('');

  const storedUser = localStorage.getItem('aeromanager_user');
  const user = storedUser
    ? JSON.parse(storedUser)
    : { nombreCompleto: 'Agente de Counter', rolActivo: 'Counter', roles: [] };
  const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
  const hasSuperAdmin = roles.some((r) => r.trim().toLowerCase() === 'superadmin');
  const hasAdmin = hasSuperAdmin || roles.some((r) => r.toLowerCase().includes('admin'));
  const hasOperador = hasSuperAdmin || roles.some((r) => r.toLowerCase().includes('operador'));

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const localStr = now.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setUtcTime(`${localStr} · UTC ${now.toISOString().slice(11, 16)}`);
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
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-zinc-200 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="AeroManager"
              className="w-9 h-9 rounded-lg object-cover"
            />
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#18181B] leading-tight">
                AeroManager
              </span>
              <span className="text-[10px] font-bold text-[#0284C7] uppercase tracking-wider">
                Counter &amp; Reservas Suite
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1.5 bg-[#F4F4F5] p-1 rounded-lg border border-zinc-200">
            {COUNTER_TABS.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `h-9 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#0284C7] text-white shadow-2xs'
                      : 'text-zinc-700 hover:bg-zinc-200/80 hover:text-[#18181B]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F4F4F5] border border-zinc-200 font-mono-code text-xs text-zinc-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>{utcTime}</span>
            </div>

            {hasSuperAdmin && (
              <button
                type="button"
                onClick={() => navigate('/superadmin/ver/counter/cartelera')}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">exit_to_app</span>
                <span>Salir de vista Counter</span>
              </button>
            )}
            {!hasSuperAdmin && hasAdmin && (
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="px-2 py-1 rounded bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700 text-[11px] font-medium border border-zinc-200 cursor-pointer"
              >
                Admin
              </button>
            )}
            {!hasSuperAdmin && hasOperador && (
              <button
                type="button"
                onClick={() => navigate('/operador/fids')}
                className="px-2 py-1 rounded bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700 text-[11px] font-medium border border-zinc-200 cursor-pointer"
              >
                Operador
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-[#18181B] leading-tight">
                  {user.nombreCompleto}
                </span>
                <span className="text-[10px] font-bold uppercase text-[#0284C7]">
                  MOSTRADOR CHECK-IN
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="h-8 px-2.5 rounded bg-zinc-100 hover:bg-red-50 hover:text-red-600 border border-zinc-200 text-zinc-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex lg:hidden overflow-x-auto px-4 py-2 bg-[#F4F4F5] border-t border-zinc-200 gap-1.5">
          {COUNTER_TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `h-8 px-3 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
                  isActive ? 'bg-[#0284C7] text-white' : 'bg-white text-zinc-700 border border-zinc-300'
                }`
              }
            >
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-24 lg:pt-20 px-4 sm:px-6 pb-10">{children}</main>
    </div>
  );
}
