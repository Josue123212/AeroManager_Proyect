import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  AeropuertoDto,
  AsientoVueloDto,
  AvionDto,
  PasajeroDto,
  PuertaEmbarqueDto,
  ReservaDto,
  RolDto,
  RutaDto,
  TerminalDto,
  UsuarioDto,
  UsuarioRolDto,
  VueloDto
} from '../../types/models';

interface EndpointHealth {
  name: string;
  endpoint: string;
  ok: boolean;
  ms: number;
  count: number;
}

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [asignaciones, setAsignaciones] = useState<UsuarioRolDto[]>([]);
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [terminales, setTerminales] = useState<TerminalDto[]>([]);
  const [puertas, setPuertas] = useState<PuertaEmbarqueDto[]>([]);
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [vuelos, setVuelos] = useState<VueloDto[]>([]);
  const [asientosVuelo, setAsientosVuelo] = useState<AsientoVueloDto[]>([]);
  const [pasajeros, setPasajeros] = useState<PasajeroDto[]>([]);
  const [reservas, setReservas] = useState<ReservaDto[]>([]);
  const [healthList, setHealthList] = useState<EndpointHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rbac' | 'vuelos' | 'reservas'>('rbac');

  const probe = async <T,>(name: string, endpoint: string): Promise<{ data: T[]; health: EndpointHealth }> => {
    const start = performance.now();
    try {
      const res = await axiosClient.get<T[]>(endpoint);
      const ms = Math.round(performance.now() - start);
      const arr = Array.isArray(res.data) ? res.data : [];
      return { data: arr, health: { name, endpoint, ok: true, ms, count: arr.length } };
    } catch {
      const ms = Math.round(performance.now() - start);
      return { data: [], health: { name, endpoint, ok: false, ms, count: 0 } };
    }
  };

  const loadData = async () => {
    setLoading(true);
    const [u, r, ur, ae, te, pu, av, ru, vu, avu, pa, re] = await Promise.all([
      probe<UsuarioDto>('Usuarios', '/usuarios'),
      probe<RolDto>('Roles', '/roles'),
      probe<UsuarioRolDto>('UsuarioRoles', '/usuarioroles'),
      probe<AeropuertoDto>('Aeropuertos', '/aeropuertos'),
      probe<TerminalDto>('Terminales', '/terminales'),
      probe<PuertaEmbarqueDto>('Puertas', '/puertasembarque'),
      probe<AvionDto>('Aviones', '/aviones'),
      probe<RutaDto>('Rutas', '/rutas'),
      probe<VueloDto>('Vuelos', '/vuelos'),
      probe<AsientoVueloDto>('Cabina', '/asientosvuelo'),
      probe<PasajeroDto>('Pasajeros', '/pasajeros'),
      probe<ReservaDto>('Reservas', '/reservas')
    ]);

    setUsuarios(u.data);
    setRoles(r.data);
    setAsignaciones(ur.data);
    setAeropuertos(ae.data);
    setTerminales(te.data);
    setPuertas(pu.data);
    setAviones(av.data);
    setRutas(ru.data);
    setVuelos(vu.data);
    setAsientosVuelo(avu.data);
    setPasajeros(pa.data);
    setReservas(re.data);
    setHealthList([
      u.health,
      r.health,
      ur.health,
      ae.health,
      te.health,
      pu.health,
      av.health,
      ru.health,
      vu.health,
      avu.health,
      pa.health,
      re.health
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const okEndpoints = healthList.filter((h) => h.ok).length;
  const avgLatency =
    healthList.length > 0
      ? Math.round(healthList.reduce((acc, h) => acc + h.ms, 0) / healthList.length)
      : 0;

  const activeUsers = usuarios.filter((u) => u.activo).length;
  const suspendedUsers = usuarios.length - activeUsers;
  const adminRole = roles.find((r) => r.nombre.trim().toLowerCase() === 'administrador');
  const activeAdmins = adminRole
    ? asignaciones.filter((a) => a.rolId === adminRole.id && a.activo).length
    : 0;

  const puertasLibres = puertas.filter((p) => p.estado.toLowerCase().includes('disp')).length;
  const avionesOperativos = aviones.filter((a) => a.estadoOperativo.toLowerCase().includes('oper')).length;

  const totalSeats = asientosVuelo.length;
  const occupiedSeats = asientosVuelo.filter((s) => s.estaOcupado).length;
  const occupancyPct = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  const confirmedReservas = reservas.filter((r) => !r.estadoReserva.toLowerCase().includes('cancel'));
  const totalRevenue = confirmedReservas.reduce((acc, r) => acc + Number(r.montoTotal || 0), 0);

  const flightStates = [
    { label: 'Programado', color: 'bg-sky-500' },
    { label: 'En Abordaje', color: 'bg-amber-500' },
    { label: 'En Vuelo', color: 'bg-emerald-500' },
    { label: 'Retrasado', color: 'bg-rose-500' },
    { label: 'Aterrizado', color: 'bg-indigo-500' }
  ];

  const recentAssignments = [...asignaciones]
    .sort((a, b) => new Date(b.fechaAsignacion).getTime() - new Date(a.fechaAsignacion).getTime())
    .slice(0, 6);

  const recentFlights = [...vuelos].slice(-6).reverse();
  const recentReservas = [...reservas].slice(-6).reverse();

  return (
    <div className="space-y-6">
      {/* Hero Banner Command Center */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0B1120] via-slate-900 to-indigo-950 text-white p-6 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-code text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                COMMAND CENTER · MODO PROGRAMMER
              </span>
              <span
                className={`font-mono-code text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  okEndpoints === healthList.length && healthList.length > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}
              >
                {loading ? 'VERIFICANDO API...' : `${okEndpoints}/${healthList.length} SERVICIOS OK · ${avgLatency} ms`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Supervisión Global de AeroManager
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Control maestro de seguridad RBAC, diagnóstico de endpoints en vivo y acceso directo a las consolas de Administrador, Operador y Counter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/superadmin/ver/admin/dashboard')}
              className="h-9 px-3.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">domain</span>
              <span>Ir a Admin</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/superadmin/ver/operador/fids')}
              className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">radar</span>
              <span>Ir a Operador</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/superadmin/ver/counter/cartelera')}
              className="h-9 px-3.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">confirmation_number</span>
              <span>Ir a Counter</span>
            </button>
            <button
              type="button"
              onClick={loadData}
              className="h-9 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">refresh</span>
              <span>Refrescar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Tarjetas KPI Multi-Dominio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500">Seguridad &amp; Cuentas</span>
            <p className="text-2xl font-bold text-[#0F172A] mt-1">{loading ? '—' : activeUsers} activas</p>
            <span className="text-[11px] text-slate-600">
              {activeAdmins} Admin · {suspendedUsers} suspendidas · {roles.length} roles
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="material-symbols-outlined">shield_person</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500">Red Aeroportuaria</span>
            <p className="text-2xl font-bold text-[#0F172A] mt-1">{loading ? '—' : aeropuertos.length} IATA</p>
            <span className="text-[11px] text-slate-600">
              {terminales.length} terminales · {puertasLibres}/{puertas.length} gates libres
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center">
            <span className="material-symbols-outlined">connecting_airports</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500">Flota &amp; Ocupación</span>
            <p className="text-2xl font-bold text-[#0F172A] mt-1">{loading ? '—' : aviones.length} aeronaves</p>
            <span className="text-[11px] text-slate-600">
              {avionesOperativos} operativas · {occupiedSeats}/{totalSeats} asientos ({occupancyPct}%)
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined">flight</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500">Operación Aérea</span>
            <p className="text-2xl font-bold text-[#0F172A] mt-1">{loading ? '—' : vuelos.length} vuelos</p>
            <span className="text-[11px] text-slate-600">{rutas.length} rutas aéreas activas</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined">flight_takeoff</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500">Comercial &amp; Reservas</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {loading ? '—' : `$${totalRevenue.toFixed(2)}`}
            </p>
            <span className="text-[11px] text-slate-600">
              {confirmedReservas.length} tickets confirmados · {pasajeros.length} pasajeros
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <span className="material-symbols-outlined">payments</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500">Accesos Rápidos</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Link
                to="/superadmin/usuarios"
                className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold"
              >
                + Cuentas
              </Link>
              <Link
                to="/superadmin/roles-permisos"
                className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold"
              >
                Matriz RBAC
              </Link>
              <Link
                to="/superadmin/ver/admin/asistente-ia"
                className="px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-[#0284C7] text-[11px] font-semibold"
              >
                Gemini IA
              </Link>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <span className="material-symbols-outlined">bolt</span>
          </div>
        </div>
      </div>

      {/* Distribución Operativa + Salud de Endpoints (Modo Programmer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F172A]">Distribución de Vuelos y Cabina</h2>
            <span className="font-mono-code text-[11px] text-slate-500">{vuelos.length} vuelos</span>
          </div>

          <div className="space-y-3">
            {flightStates.map((st) => {
              const count = vuelos.filter((v) =>
                v.estado.toLowerCase().includes(st.label.toLowerCase())
              ).length;
              const pct = vuelos.length > 0 ? Math.round((count / vuelos.length) * 100) : 0;
              return (
                <div key={st.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{st.label}</span>
                    <span className="font-mono-code font-bold text-slate-800">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${st.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Ocupación Global de Asientos</span>
              <span className="font-mono-code font-bold text-indigo-700">
                {occupiedSeats} / {totalSeats} ({occupancyPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">
                Diagnóstico de Endpoints en Vivo (Programmer)
              </h2>
              <p className="text-[11px] text-slate-500">
                Sondeo paralelo de disponibilidad y latencia de los 12 módulos principales de la API.
              </p>
            </div>
            <span className="font-mono-code text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Avg: {avgLatency} ms
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {healthList.map((h) => (
              <div
                key={h.endpoint}
                className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                  h.ok
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">{h.name}</span>
                  <span
                    className={`font-mono-code text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      h.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {h.ok ? '200' : 'ERR'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11px] font-mono-code text-slate-500">
                  <span>{h.count} reg.</span>
                  <span>{h.ms} ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actividad Reciente con Pestañas */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#0F172A]">Monitor de Actividad Reciente</h2>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('rbac')}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                activeTab === 'rbac'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Auditoría RBAC ({asignaciones.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vuelos')}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                activeTab === 'vuelos'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Vuelos ({vuelos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reservas')}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                activeTab === 'reservas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Reservas ({reservas.length})
            </button>
          </div>
        </div>

        {activeTab === 'rbac' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">ID</th>
                <th className="py-2.5 px-4 font-semibold">Usuario</th>
                <th className="py-2.5 px-4 font-semibold">Rol</th>
                <th className="py-2.5 px-4 font-semibold">Fecha</th>
                <th className="py-2.5 px-4 font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {recentAssignments.map((item) => {
                const u = usuarios.find((x) => x.id === item.usuarioId);
                const r = roles.find((x) => x.id === item.rolId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono-code text-slate-500">#{item.id}</td>
                    <td className="py-2.5 px-4 font-semibold text-[#0F172A]">
                      {u ? `${u.nombreCompleto} (${u.email})` : `Usuario #${item.usuarioId}`}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono-code font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                        {r ? r.nombre : `Rol #${item.rolId}`}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono-code text-slate-600">
                      {new Date(item.fechaAsignacion).toLocaleString('es-PE')}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                          item.activo
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-slate-100 border-slate-300 text-slate-600'
                        }`}
                      >
                        {item.activo ? 'Vigente' : 'Revocado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'vuelos' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Vuelo</th>
                <th className="py-2.5 px-4 font-semibold">Salida</th>
                <th className="py-2.5 px-4 font-semibold">Capacidad</th>
                <th className="py-2.5 px-4 font-semibold">Tarifa Base</th>
                <th className="py-2.5 px-4 font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {recentFlights.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono-code font-bold text-[#0284C7]">{v.numeroVuelo}</td>
                  <td className="py-2.5 px-4 font-mono-code text-slate-600">
                    {new Date(v.fechaHoraSalida).toLocaleString('es-PE')}
                  </td>
                  <td className="py-2.5 px-4 font-mono-code">{v.capacidadVuelo} PAX</td>
                  <td className="py-2.5 px-4 font-mono-code font-semibold">${v.precioBase.toFixed(2)} USD</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7] font-mono-code text-[11px] font-semibold">
                      {v.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'reservas' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Ticket</th>
                <th className="py-2.5 px-4 font-semibold">Vuelo ID</th>
                <th className="py-2.5 px-4 font-semibold">Fecha</th>
                <th className="py-2.5 px-4 font-semibold">Monto Total</th>
                <th className="py-2.5 px-4 font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {recentReservas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No hay reservas registradas.
                  </td>
                </tr>
              ) : (
                recentReservas.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono-code font-bold text-indigo-700">{r.codigoTicket}</td>
                    <td className="py-2.5 px-4 font-mono-code">Vuelo #{r.vueloId}</td>
                    <td className="py-2.5 px-4 font-mono-code text-slate-600">
                      {new Date(r.fechaReserva).toLocaleString('es-PE')}
                    </td>
                    <td className="py-2.5 px-4 font-mono-code font-semibold text-emerald-700">
                      ${Number(r.montoTotal).toFixed(2)} USD
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono-code text-[11px] font-semibold">
                        {r.estadoReserva}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
