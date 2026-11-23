import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosClient, { extractApiError } from '../../api/axiosClient';
import { resolveScopedPath } from '../../utils/scopedNavigation';
import { AeropuertoDto, AvionDto, ReservaDto, RutaDto, VueloDto } from '../../types/models';
import { openGeminiAssistant } from '../../components/ai/GeminiFloatingAssistant';

export default function DashboardEjecutivoPage() {
  const { pathname } = useLocation();
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [vuelos, setVuelos] = useState<VueloDto[]>([]);
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [reservas, setReservas] = useState<ReservaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [aeroRes, avRes, vueRes, rutRes, resRes] = await Promise.all([
        axiosClient.get<AeropuertoDto[]>('/aeropuertos'),
        axiosClient.get<AvionDto[]>('/aviones'),
        axiosClient.get<VueloDto[]>('/vuelos'),
        axiosClient.get<RutaDto[]>('/rutas'),
        axiosClient.get<ReservaDto[]>('/reservas')
      ]);
      setAeropuertos(aeroRes.data);
      setAviones(avRes.data);
      setVuelos(vueRes.data);
      setRutas(rutRes.data);
      setReservas(resRes.data);
    } catch (err: any) {
      setErrorMsg(
        extractApiError(err, 'No se pudo conectar con Aeromanager.Api. Asegúrese de que el backend esté corriendo.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const aeropuertosActivos = aeropuertos.filter((a) => a.activo).length;
  const avionesOperativos = aviones.filter(
    (a) => a.activo && a.estadoOperativo.toUpperCase() === 'OPERATIVO'
  ).length;
  const avionesMantenimiento = aviones.filter(
    (a) => a.activo && a.estadoOperativo.toUpperCase() !== 'OPERATIVO'
  ).length;
  const vuelosProgramados = vuelos.filter((v) => v.activo).length;
  const reservasConfirmadas = reservas.filter(
    (r) => r.activo && r.estadoReserva.toUpperCase() !== 'CANCELADA'
  );
  const facturacionTotal = reservasConfirmadas.reduce((acc, r) => acc + r.montoTotal, 0);

  const getRutaLabel = (rutaId: number) => {
    const r = rutas.find((x) => x.id === rutaId);
    if (!r) return `Ruta #${rutaId}`;
    const orig = aeropuertos.find((a) => a.id === r.aeropuertoOrigenId)?.codigoIata || `#${r.aeropuertoOrigenId}`;
    const dest = aeropuertos.find((a) => a.id === r.aeropuertoDestinoId)?.codigoIata || `#${r.aeropuertoDestinoId}`;
    return `${orig} → ${dest} (${r.codigoRuta})`;
  };

  const getAvionLabel = (avionId: number) => {
    const av = aviones.find((x) => x.id === avionId);
    return av ? av.matricula : `AV #${avionId}`;
  };

  const getStatusBadge = (estado: string) => {
    const st = estado.toUpperCase();
    if (st.includes('ABORD')) return 'bg-amber-50 border-amber-200 text-amber-700';
    if (st.includes('VUELO') || st.includes('ATERRIZ')) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (st.includes('CANCEL')) return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-sky-50 border-sky-200 text-[#0284C7]';
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Panel de Control Operativo
            </span>
            <span className="text-zinc-400 font-mono-code text-xs">/</span>
            <span className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider">
              ADMINISTRADOR
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#18181B] tracking-tight">Dashboard Ejecutivo</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitoreo centralizado de infraestructura IATA, flota aérea, vuelos y facturación en
            tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMetrics}
            className="font-mono-code text-xs px-3 py-1.5 rounded bg-[#F4F4F5] hover:bg-zinc-200 border border-zinc-200 text-zinc-700 cursor-pointer"
          >
            {loading ? 'Consultando el sistema...' : '↻ Actualizar Telemetría'}
          </button>
        </div>
      </section>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* 4 Tarjetas KPI alimentadas 100% por la BD */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="flex flex-col justify-between p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Infraestructura
              </span>
              <span className="text-sm font-semibold text-[#18181B] mt-0.5">
                Aeropuertos Activos
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#0284C7]">
              <span className="material-symbols-outlined text-[20px]">connecting_airports</span>
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#18181B] tracking-tight">
              {aeropuertosActivos} Sedes
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
            <span className="font-mono-code text-zinc-500">Sistema AeroManager</span>
            <Link
              to={resolveScopedPath(pathname, '/admin/aeropuertos')}
              className="text-emerald-700 font-semibold font-mono-code text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded hover:bg-emerald-100"
            >
              Ver Sedes →
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Activos en Red
              </span>
              <span className="text-sm font-semibold text-[#18181B] mt-0.5">Flota de Aviones</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[#0284C7]">
              <span className="material-symbols-outlined text-[20px]">flight</span>
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#18181B] tracking-tight">
              {aviones.filter((a) => a.activo).length} Aeronaves
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200/70">
            <span className="text-emerald-700 font-semibold">{avionesOperativos} en servicio</span>
            <span className="font-mono-code text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              {avionesMantenimiento} otros estados
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Tráfico Operativo
              </span>
              <span className="text-sm font-semibold text-[#18181B] mt-0.5">
                Vuelos Programados
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#0284C7]">
              <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#18181B] tracking-tight">
              {vuelosProgramados} Vuelos
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
            <span className="text-zinc-500 font-mono-code">Rutas: {rutas.length}</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold font-mono-code text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Sistema AeroManager
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Facturación / Gross
              </span>
              <span className="text-sm font-semibold text-[#18181B] mt-0.5">
                Reservas Confirmadas
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[#0284C7]">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#18181B] tracking-tight">
              ${facturacionTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200/70">
            <span className="text-zinc-600 font-mono-code">Divisa: USD</span>
            <span className="text-emerald-700 font-semibold font-mono-code text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              {reservasConfirmadas.length} Tickets
            </span>
          </div>
        </div>
      </section>

      {/* Gráficos Analíticos en Tiempo Real (Circular, Barras y Línea/Área) */}
      {(() => {
        const activeFlights = vuelos.filter((v) => v.activo);
        const stateCounts = [
          {
            label: 'Programado',
            color: '#0284C7',
            count: activeFlights.filter((v) => v.estado.toUpperCase().includes('PROGRAM')).length
          },
          {
            label: 'En Abordaje',
            color: '#D97706',
            count: activeFlights.filter((v) => v.estado.toUpperCase().includes('ABORD')).length
          },
          {
            label: 'En Vuelo / Aterrizado',
            color: '#059669',
            count: activeFlights.filter(
              (v) => v.estado.toUpperCase().includes('VUELO') || v.estado.toUpperCase().includes('ATERRIZ')
            ).length
          },
          {
            label: 'Retrasado / Cancelado',
            color: '#E11D48',
            count: activeFlights.filter(
              (v) => v.estado.toUpperCase().includes('RETRAS') || v.estado.toUpperCase().includes('CANCEL')
            ).length
          }
        ];
        const totalForDonut = Math.max(
          stateCounts.reduce((acc, s) => acc + s.count, 0),
          1
        );
        const radius = 44;
        const circumference = 2 * Math.PI * radius;
        let accumulatedOffset = 0;

        const barFlights = activeFlights.slice(0, 6);
        const maxFare = Math.max(...barFlights.map((v) => v.precioBase), 1);
        const maxCap = Math.max(...barFlights.map((v) => v.capacidadVuelo), 1);

        const chartW = 280;
        const chartH = 120;
        const padX = 20;
        const padY = 16;
        const linePoints = barFlights.map((v, idx) => {
          const x =
            barFlights.length <= 1
              ? chartW / 2
              : padX + (idx * (chartW - padX * 2)) / (barFlights.length - 1);
          const y = chartH - padY - (v.capacidadVuelo / maxCap) * (chartH - padY * 2);
          return { x, y, code: v.numeroVuelo, cap: v.capacidadVuelo };
        });
        const polylineStr = linePoints.map((p) => `${p.x},${p.y}`).join(' ');
        const areaStr =
          linePoints.length > 0
            ? `${linePoints[0].x},${chartH - padY} ${polylineStr} ${
                linePoints[linePoints.length - 1].x
              },${chartH - padY}`
            : '';

        return (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 1. Gráfico Circular (Donut) */}
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Estado Operativo
                  </span>
                  <h3 className="text-sm font-bold text-[#18181B]">Distribución de Vuelos</h3>
                </div>
                <span className="material-symbols-outlined text-[#0284C7] text-[20px]">donut_large</span>
              </div>

              <div className="flex items-center gap-4">
                <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    className="text-zinc-200"
                    strokeWidth="14"
                  />
                  {stateCounts.map((seg) => {
                    if (seg.count === 0) return null;
                    const segLen = (seg.count / totalForDonut) * circumference;
                    const dashArray = `${segLen} ${circumference - segLen}`;
                    const dashOffset = -accumulatedOffset;
                    accumulatedOffset += segLen;
                    return (
                      <circle
                        key={seg.label}
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="14"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        transform="rotate(-90 60 60)"
                      />
                    );
                  })}
                  <text
                    x="60"
                    y="57"
                    textAnchor="middle"
                    className="fill-current text-[#18181B] text-lg font-bold"
                  >
                    {activeFlights.length}
                  </text>
                  <text
                    x="60"
                    y="71"
                    textAnchor="middle"
                    className="fill-current text-zinc-500 text-[9px] font-semibold uppercase"
                  >
                    Vuelos
                  </text>
                </svg>

                <div className="flex-1 space-y-1.5 text-xs">
                  {stateCounts.map((seg) => (
                    <div key={seg.label} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-zinc-600 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="truncate">{seg.label}</span>
                      </span>
                      <span className="font-mono-code font-bold text-[#18181B]">{seg.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Gráfico de Barras Verticales */}
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Tarifario por Vuelo
                  </span>
                  <h3 className="text-sm font-bold text-[#18181B]">Tarifa Base (USD)</h3>
                </div>
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">bar_chart</span>
              </div>

              {barFlights.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-zinc-500">
                  Sin vuelos registrados.
                </div>
              ) : (
                <div className="h-32 flex items-end justify-around gap-2 pt-4">
                  {barFlights.map((v) => {
                    const heightPct = Math.max(Math.round((v.precioBase / maxFare) * 100), 12);
                    return (
                      <div key={v.id} className="flex-1 flex flex-col items-center h-full justify-end gap-1">
                        <span className="font-mono-code text-[10px] font-bold text-emerald-700">
                          ${Math.round(v.precioBase)}
                        </span>
                        <div className="w-full max-w-[28px] flex-1 flex items-end bg-zinc-100 rounded-t overflow-hidden">
                          <div
                            className="w-full bg-gradient-to-t from-[#0284C7] to-sky-400 rounded-t transition-all"
                            style={{ height: `${heightPct}%` }}
                            title={`${v.numeroVuelo}: $${v.precioBase.toFixed(2)} USD`}
                          />
                        </div>
                        <span className="font-mono-code text-[10px] font-semibold text-zinc-600 truncate max-w-full">
                          {v.numeroVuelo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Gráfico de Línea / Área */}
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Oferta de Cabina
                  </span>
                  <h3 className="text-sm font-bold text-[#18181B]">Capacidad por Vuelo (PAX)</h3>
                </div>
                <span className="material-symbols-outlined text-indigo-600 text-[20px]">show_chart</span>
              </div>

              {linePoints.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-zinc-500">
                  Sin datos de capacidad.
                </div>
              ) : (
                <div className="flex flex-col">
                  <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-28 overflow-visible">
                    <defs>
                      <linearGradient id="capAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <line x1={padX} y1={chartH - padY} x2={chartW - padX} y2={chartH - padY} stroke="#CBD5E1" strokeWidth="1" />
                    {areaStr && <polygon points={areaStr} fill="url(#capAreaGrad)" />}
                    {linePoints.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polylineStr}
                      />
                    )}
                    {linePoints.map((pt) => (
                      <g key={pt.code}>
                        <circle cx={pt.x} cy={pt.y} r="4" fill="#6366F1" stroke="#FFFFFF" strokeWidth="1.5" />
                        <text
                          x={pt.x}
                          y={pt.y - 8}
                          textAnchor="middle"
                          className="fill-current text-indigo-600 font-mono-code text-[9px] font-bold"
                        >
                          {pt.cap}
                        </text>
                      </g>
                    ))}
                  </svg>
                  <div className="flex items-center justify-between px-2 text-[10px] font-mono-code text-zinc-500">
                    {linePoints.map((pt) => (
                      <span key={pt.code}>{pt.code}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* Tabla de Actividad Reciente de Vuelos */}
      <section className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden flex flex-col">
        <div className="p-4 sm:px-6 bg-[#F4F4F5] border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#0284C7] text-[22px]">
              airplane_ticket
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#18181B]">Actividad Reciente de Vuelos</h2>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Últimos vuelos programados
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={resolveScopedPath(pathname, '/admin/reportes-excel')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-300 text-xs font-semibold transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[17px]">table_chart</span>
              <span>Ir a Reportes Excel (.xlsx)</span>
            </Link>
            <button
              type="button"
              onClick={openGeminiAssistant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-white bg-[#0284C7] hover:bg-[#0369A1] text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">smart_toy</span>
              <span>Abrir Asistente IA (Gemini)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 sm:px-6 font-semibold">Vuelo</th>
                <th className="py-2.5 px-4 font-semibold">Ruta (Origen → Destino)</th>
                <th className="py-2.5 px-4 font-semibold">Aeronave &amp; Matrícula</th>
                <th className="py-2.5 px-4 font-semibold">Horario Programado</th>
                <th className="py-2.5 px-4 font-semibold">Tarifa Base</th>
                <th className="py-2.5 px-4 sm:px-6 font-semibold text-right">Estado Operativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-xs text-zinc-800">
              {vuelos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    {loading
                      ? 'Cargando vuelos...'
                      : 'No hay vuelos registrados aún todavía.'}
                  </td>
                </tr>
              ) : (
                vuelos.slice(0, 8).map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4 sm:px-6 font-mono-code font-bold text-[#0284C7]">
                      {v.numeroVuelo}
                    </td>
                    <td className="py-3 px-4 font-medium">{getRutaLabel(v.rutaId)}</td>
                    <td className="py-3 px-4 font-mono-code text-zinc-700">
                      {getAvionLabel(v.avionId)}
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-600">
                      {new Date(v.fechaHoraSalida).toLocaleString('es-PE', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono-code font-semibold">
                      ${v.precioBase.toFixed(2)} USD
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${getStatusBadge(
                          v.estado
                        )}`}
                      >
                        {v.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
