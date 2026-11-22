import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const GOVERNANCE_LINKS = [
  { label: 'Centro de Comando', icon: 'monitoring', path: '/superadmin/dashboard' },
  { label: 'Cuentas y Administradores', icon: 'manage_accounts', path: '/superadmin/usuarios' },
  { label: 'Roles y Privilegios (RBAC)', icon: 'admin_panel_settings', path: '/superadmin/roles-permisos' }
];

const CONSOLE_GROUPS = [
  {
    key: 'admin',
    label: 'Consola Administrador',
    icon: 'domain',
    badge: 'ADMIN',
    items: [
      { label: 'Dashboard Ejecutivo', path: '/superadmin/ver/admin/dashboard' },
      { label: 'Países', path: '/superadmin/ver/admin/paises' },
      { label: 'Ciudades', path: '/superadmin/ver/admin/ciudades' },
      { label: 'Tipos de Documento', path: '/superadmin/ver/admin/tipos-documento' },
      { label: 'Aeropuertos IATA', path: '/superadmin/ver/admin/aeropuertos' },
      { label: 'Terminales', path: '/superadmin/ver/admin/terminales' },
      { label: 'Puertas de Embarque', path: '/superadmin/ver/admin/puertas-embarque' },
      { label: 'Aerolíneas', path: '/superadmin/ver/admin/aerolineas' },
      { label: 'Modelos de Avión', path: '/superadmin/ver/admin/modelos-avion' },
      { label: 'Aviones Físicos', path: '/superadmin/ver/admin/aviones' },
      { label: 'Clases de Asiento', path: '/superadmin/ver/admin/clases-asiento' },
      { label: 'Asientos', path: '/superadmin/ver/admin/asientos' },
      { label: 'Usuarios Operativos', path: '/superadmin/ver/admin/usuarios' },
      { label: 'Roles Operativos', path: '/superadmin/ver/admin/roles-permisos' },
      { label: 'Reportes Excel (.xls)', path: '/superadmin/ver/admin/reportes-excel' },
      { label: 'Asistente IA (Gemini)', path: '/superadmin/ver/admin/asistente-ia' }
    ]
  },
  {
    key: 'operador',
    label: 'Consola Operador FIDS',
    icon: 'radar',
    badge: 'OPS',
    items: [
      { label: 'Monitor FIDS en Vivo', path: '/superadmin/ver/operador/fids' },
      { label: 'Rutas Aéreas', path: '/superadmin/ver/operador/rutas' },
      { label: 'Programación de Vuelos', path: '/superadmin/ver/operador/vuelos' },
      { label: 'Disponibilidad de Cabina', path: '/superadmin/ver/operador/cabina' },
      { label: 'Monitor de Gates', path: '/superadmin/ver/operador/gates' },
      { label: 'Flota Operativa', path: '/superadmin/ver/operador/flota' }
    ]
  },
  {
    key: 'counter',
    label: 'Mostrador Counter',
    icon: 'confirmation_number',
    badge: 'COUNTER',
    items: [
      { label: 'Cartelera de Vuelos', path: '/superadmin/ver/counter/cartelera' },
      { label: 'Mapa de Cabina y Reserva', path: '/superadmin/ver/counter/cabina' },
      { label: 'Padrón de Pasajeros', path: '/superadmin/ver/counter/pasajeros' },
      { label: 'Tickets Emitidos', path: '/superadmin/ver/counter/tickets' }
    ]
  }
];

interface SuperAdminHeaderProps {
  children?: React.ReactNode;
}

export default function SuperAdminHeader({ children }: SuperAdminHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [nombreUsuario, setNombreUsuario] = useState('SuperAdmin');
  const [utcTime, setUtcTime] = useState('');
  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    if (location.pathname.startsWith('/superadmin/ver/admin')) return 'admin';
    if (location.pathname.startsWith('/superadmin/ver/operador')) return 'operador';
    if (location.pathname.startsWith('/superadmin/ver/counter')) return 'counter';
    return null;
  });

  useEffect(() => {
    if (location.pathname.startsWith('/superadmin/ver/admin')) setOpenGroup('admin');
    else if (location.pathname.startsWith('/superadmin/ver/operador')) setOpenGroup('operador');
    else if (location.pathname.startsWith('/superadmin/ver/counter')) setOpenGroup('counter');
  }, [location.pathname]);

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
    const updateClock = () => setUtcTime(`UTC ${new Date().toISOString().slice(11, 19)}`);
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aeromanager_token');
    localStorage.removeItem('aeromanager_user');
    navigate('/login');
  };

  const getRolePreviewAction = () => {
    if (location.pathname.startsWith('/superadmin/ver/admin')) {
      const subPath = location.pathname.replace('/superadmin/ver/admin', '/admin');
      return { label: 'Ver con vista de Administrador', target: subPath };
    }
    if (location.pathname.startsWith('/superadmin/ver/operador')) {
      const subPath = location.pathname.replace('/superadmin/ver/operador', '/operador');
      return { label: 'Ver con vista de Operador', target: subPath };
    }
    if (location.pathname.startsWith('/superadmin/ver/counter')) {
      const subPath = location.pathname.replace('/superadmin/ver/counter', '/counter');
      return { label: 'Ver con vista de Counter', target: subPath };
    }
    return null;
  };

  const previewAction = getRolePreviewAction();

  return (
    <div className="superadmin-dark min-h-screen bg-[#0F172A] text-slate-100">
      {/* Sidebar Lateral Oscuro Command Center */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#090D16] text-slate-200 border-r border-slate-800/90 z-50 flex-col">
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800/80 bg-[#070B12]">
          <img src="/logo.png" alt="AeroManager" className="w-8 h-8 rounded-lg shadow-xs object-cover" />
          <div className="leading-tight">
            <span className="text-sm font-bold text-white tracking-tight block">AeroManager</span>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
              Command Center
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            <span className="px-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Gobierno &amp; Seguridad
            </span>
            <nav className="flex flex-col gap-1">
              {GOVERNANCE_LINKS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <span className="px-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Módulos de Consolas
            </span>
            <div className="flex flex-col gap-1.5">
              {CONSOLE_GROUPS.map((group) => {
                const isOpen = openGroup === group.key;
                return (
                  <div key={group.key} className="rounded-lg border border-slate-800/80 bg-[#0D1320]">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenGroup(isOpen ? null : group.key);
                        if (!isOpen) navigate(group.items[0].path);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[17px] text-sky-400">
                          {group.icon}
                        </span>
                        <span>{group.label}</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400">
                        {isOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-2 pb-2 space-y-0.5 border-t border-slate-800/70 pt-1.5">
                        {group.items.map((sub) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            className={({ isActive }) =>
                              `block px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                                isActive
                                  ? 'bg-sky-600 text-white font-semibold'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                              }`
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800/80 bg-[#070B12]">
          <div className="px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300">Supervisión Root</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono-code text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ONLINE
            </span>
          </div>
        </div>
      </aside>

      {/* Contenedor Principal */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 h-16 bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-800 z-40 px-4 lg:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex lg:hidden items-center gap-2">
              <img src="/logo.png" alt="AeroManager" className="w-7 h-7 rounded object-cover" />
              <span className="text-sm font-bold text-white">SuperAdmin</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-slate-300 font-mono-code text-xs">
              <span className="material-symbols-outlined text-[15px] text-indigo-400">schedule</span>
              <span>{utcTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {previewAction && (
              <button
                type="button"
                onClick={() => navigate(previewAction.target)}
                className="h-8 px-3 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>{previewAction.label}</span>
              </button>
            )}

            <div className="hidden sm:flex flex-col items-end leading-tight ml-1">
              <span className="text-xs font-bold text-slate-100">{nombreUsuario}</span>
              <span className="font-mono-code text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                SUPERADMIN · ACCESO TOTAL
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="h-8 px-3 rounded-md bg-slate-800 hover:bg-red-600/90 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* Navegación móvil */}
        <nav className="lg:hidden bg-[#090D16] border-b border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
          {GOVERNANCE_LINKS.map((item) => (
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
          {CONSOLE_GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => navigate(g.items[0].path)}
              className="px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap bg-slate-800 text-sky-300"
            >
              {g.badge}
            </button>
          ))}
        </nav>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
