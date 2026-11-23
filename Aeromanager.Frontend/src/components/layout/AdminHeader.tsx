import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface NavSection {
  title?: string;
  items: { label: string; icon: string; path: string }[];
}

const ADMIN_SECTIONS: NavSection[] = [
  {
    items: [{ label: 'Dashboard Ejecutivo', icon: 'dashboard', path: '/admin/dashboard' }]
  },
  {
    title: 'Catálogos',
    items: [
      { label: 'Países', icon: 'public', path: '/admin/paises' },
      { label: 'Ciudades', icon: 'location_city', path: '/admin/ciudades' },
      { label: 'Tipos de Documento', icon: 'badge', path: '/admin/tipos-documento' }
    ]
  },
  {
    title: 'Infraestructura',
    items: [
      { label: 'Aeropuertos IATA', icon: 'connecting_airports', path: '/admin/aeropuertos' },
      { label: 'Terminales', icon: 'domain', path: '/admin/terminales' },
      { label: 'Puertas de Embarque', icon: 'door_sliding', path: '/admin/puertas-embarque' }
    ]
  },
  {
    title: 'Flota Aérea',
    items: [
      { label: 'Aerolíneas', icon: 'flight_takeoff', path: '/admin/aerolineas' },
      { label: 'Modelos de Avión', icon: 'engineering', path: '/admin/modelos-avion' },
      { label: 'Aviones Físicos', icon: 'flight', path: '/admin/aviones' },
      { label: 'Clases de Asiento', icon: 'airline_seat_recline_extra', path: '/admin/clases-asiento' },
      { label: 'Configuración Asientos', icon: 'chair', path: '/admin/asientos' }
    ]
  },
  {
    title: 'Seguridad',
    items: [
      { label: 'Usuarios', icon: 'manage_accounts', path: '/admin/usuarios' },
      { label: 'Roles y Permisos', icon: 'admin_panel_settings', path: '/admin/roles-permisos' }
    ]
  },
  {
    title: 'Operaciones',
    items: [
      { label: 'Reportes Excel (.xlsx)', icon: 'table_chart', path: '/admin/reportes-excel' }
    ]
  }
];

interface AdminHeaderProps {
  children?: React.ReactNode;
}

export default function AdminHeader({ children }: AdminHeaderProps) {
  const navigate = useNavigate();
  const [utcTime, setUtcTime] = useState('');

  const storedUser = localStorage.getItem('aeromanager_user');
  const user = storedUser
    ? JSON.parse(storedUser)
    : { nombreCompleto: 'Administrador', rolActivo: 'Administrador', roles: [] };
  const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
  const hasSuperAdmin = roles.some((r) => r.trim().toLowerCase() === 'superadmin');
  const hasOperador = hasSuperAdmin || roles.some((r) => r.toLowerCase().includes('operador'));
  const hasCounter = hasSuperAdmin || roles.some((r) => r.toLowerCase().includes('counter'));

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
              Admin Suite
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {ADMIN_SECTIONS.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <div className="px-2.5 mb-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    {section.title}
                  </span>
                </div>
              )}
              <nav className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-all ${
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
          ))}
        </div>

        <div className="p-2.5 bg-white border-t border-zinc-200">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#F4F4F5]">
            <span className="text-[11px] font-semibold text-zinc-600">Consola Ejecutiva</span>
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
                onClick={() => navigate('/superadmin/ver/admin/dashboard')}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">exit_to_app</span>
                <span>Salir de vista Administrador</span>
              </button>
            )}
            {!hasSuperAdmin && hasOperador && (
              <button
                type="button"
                onClick={() => navigate('/operador/fids')}
                className="px-2.5 py-1 rounded bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition-colors cursor-pointer"
              >
                Consola Operador
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
                  ADMINISTRADOR
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar Sesión"
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
