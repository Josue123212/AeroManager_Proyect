import React from 'react';
import { NavLink } from 'react-router-dom';

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

export default function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#F4F4F5] border-r border-zinc-200 z-50 flex flex-col">
      <div className="h-16 px-4 flex items-center gap-2.5 bg-white border-b border-zinc-200">
        <div className="w-8 h-8 rounded bg-[#0284C7] text-white flex items-center justify-center">
          <span className="material-symbols-outlined text-lg">connecting_airports</span>
        </div>
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
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-zinc-500">terminal</span>
            <span className="font-mono-code text-xs text-zinc-700 font-medium">v2.4.0-prod</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
        </div>
      </div>
    </aside>
  );
}
