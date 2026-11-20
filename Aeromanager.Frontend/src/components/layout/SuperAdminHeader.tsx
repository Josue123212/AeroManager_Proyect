import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const SUPERADMIN_LINKS = [
  { label: 'Panel de Gobierno', icon: 'shield_person', path: '/superadmin/dashboard' },
  { label: 'Cuentas y Administradores', icon: 'manage_accounts', path: '/superadmin/usuarios' },
  { label: 'Roles y Privilegios (RBAC)', icon: 'admin_panel_settings', path: '/superadmin/roles-permisos' }
];

interface SuperAdminHeaderProps {
  children?: React.ReactNode;
}

export default function SuperAdminHeader({ children }: SuperAdminHeaderProps) {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('SuperAdmin');

  useEffect(() => {
    const raw = localStorage.getItem('aeromanager_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.nombreCompleto) setNombreUsuario(parsed.nombreCompleto);
      } catch {
        // Ignorar parse error
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aeromanager_token');
    localStorage.removeItem('aeromanager_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#18181B] flex flex-col">
      <header className="h-14 bg-[#0F172A] text-white border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[20px]">security</span>
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold tracking-tight block">AeroManager Governance</span>
            <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold">
              Consola SuperAdmin
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {SUPERADMIN_LINKS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs font-semibold text-white">{nombreUsuario}</span>
            <span className="font-mono-code text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              SUPERADMIN
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="h-8 px-3 rounded bg-slate-800 hover:bg-red-600/90 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Salir</span>
          </button>
        </div>
      </header>

      <nav className="md:hidden bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center gap-1 overflow-x-auto">
        {SUPERADMIN_LINKS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-300'
              }`
            }
          >
            <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
