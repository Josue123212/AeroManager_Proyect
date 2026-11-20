import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import {
  AeropuertoDto,
  AvionDto,
  ModeloAvionDto,
  PuertaEmbarqueDto,
  RutaDto,
  TerminalDto,
  VueloDto
} from '../../types/models';

export default function MonitorFidsPage() {
  const [vuelos, setVuelos] = useState<VueloDto[]>([]);
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [modelos, setModelos] = useState<ModeloAvionDto[]>([]);
  const [puertas, setPuertas] = useState<PuertaEmbarqueDto[]>([]);
  const [terminales, setTerminales] = useState<TerminalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedTerminalId, setSelectedTerminalId] = useState<string>('ALL');
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [vRes, rRes, aRes, avRes, mRes, pRes, tRes] = await Promise.all([
        axiosClient.get<VueloDto[]>('/vuelos'),
        axiosClient.get<RutaDto[]>('/rutas'),
        axiosClient.get<AeropuertoDto[]>('/aeropuertos'),
        axiosClient.get<AvionDto[]>('/aviones'),
        axiosClient.get<ModeloAvionDto[]>('/modelosavion'),
        axiosClient.get<PuertaEmbarqueDto[]>('/puertasembarque'),
        axiosClient.get<TerminalDto[]>('/terminales')
      ]);
      setVuelos(vRes.data);
      setRutas(rRes.data);
      setAeropuertos(aRes.data);
      setAviones(avRes.data);
      setModelos(mRes.data);
      setPuertas(pRes.data);
      setTerminales(tRes.data);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Error al sincronizar el Monitor FIDS desde Aeromanager.Api.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const vuelosActivos = vuelos.filter((v) => v.activo);
  const vuelosEnAbordajeOVuelo = vuelosActivos.filter((v) => {
    const st = v.estado.toUpperCase();
    return st.includes('ABORD') || st.includes('VUELO');
  });
  const avionesAsignadosUnicos = new Set(vuelosActivos.map((v) => v.avionId)).size;
  const puertasLibres = puertas.filter(
    (p) => p.activo && p.estado.toUpperCase() === 'DISPONIBLE'
  ).length;

  const getRutaTrayecto = (rutaId: number) => {
    const r = rutas.find((x) => x.id === rutaId);
    if (!r) return `Ruta #${rutaId}`;
    const orig = aeropuertos.find((a) => a.id === r.aeropuertoOrigenId);
    const dest = aeropuertos.find((a) => a.id === r.aeropuertoDestinoId);
    return `${orig ? orig.codigoIata : r.aeropuertoOrigenId} → ${
      dest ? dest.codigoIata : r.aeropuertoDestinoId
    } (${r.codigoRuta})`;
  };

  const getAvionInfo = (avionId: number) => {
    const av = aviones.find((x) => x.id === avionId);
    if (!av) return `AV #${avionId}`;
    const mod = modelos.find((m) => m.id === av.modeloAvionId);
    return mod ? `${av.matricula} · ${mod.fabricante} ${mod.nombreModelo}` : av.matricula;
  };

  const getGateInfo = (puertaId: number) => {
    const p = puertas.find((x) => x.id === puertaId);
    if (!p) return `GATE #${puertaId}`;
    const t = terminales.find((x) => x.id === p.terminalId);
    return `GATE ${p.codigoGate}${t ? ` (${t.codigo})` : ''}`;
  };

  const getStatusBadge = (estado: string) => {
    const st = estado.toUpperCase();
    if (st.includes('ABORD')) return 'bg-amber-50 border-amber-200 text-amber-700';
    if (st.includes('VUELO') || st.includes('ATERRIZ'))
      return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (st.includes('RETRAS') || st.includes('DEMOR') || st.includes('CANCEL'))
      return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-sky-50 border-sky-200 text-[#0284C7]';
  };

  const filteredVuelos = vuelosActivos.filter((v) => {
    if (selectedTerminalId !== 'ALL') {
      const puerta = puertas.find((p) => p.id === v.puertaEmbarqueId);
      if (!puerta || String(puerta.terminalId) !== selectedTerminalId) return false;
    }
    if (selectedEstado !== 'ALL') {
      if (v.estado.toUpperCase() !== selectedEstado.toUpperCase()) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const trayecto = getRutaTrayecto(v.rutaId).toLowerCase();
      const avionStr = getAvionInfo(v.avionId).toLowerCase();
      return (
        v.numeroVuelo.toLowerCase().includes(q) ||
        trayecto.includes(q) ||
        avionStr.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Consola Operador de Vuelos / Torre &amp; Despacho
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">
            Monitor FIDS de Tráfico Aéreo en Vivo
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Tablero operativo de salidas, llegadas, puertas de embarque y aeronaves conectadas a
            Neon Cloud PostgreSQL.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="h-9 px-4 rounded bg-[#F4F4F5] hover:bg-zinc-200 border border-zinc-200 text-zinc-700 font-mono-code text-xs font-semibold cursor-pointer"
        >
          {loading ? 'Sincronizando FIDS...' : '↻ Refrescar Tablero FIDS'}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* 3 Tarjetas KPI Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Operaciones Activas
            </span>
            <span className="material-symbols-outlined text-[#0284C7]">flight_takeoff</span>
          </div>
          <div className="text-3xl font-bold text-[#18181B] my-2">
            {vuelosActivos.length} Vuelos
          </div>
          <span className="font-mono-code text-xs text-zinc-500">
            Vuelos Programados en Base de Datos
          </span>
        </div>

        <div className="p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Movimiento en Pista / Gate
            </span>
            <span className="material-symbols-outlined text-amber-600">sensors</span>
          </div>
          <div className="text-3xl font-bold text-[#18181B] my-2">
            {vuelosEnAbordajeOVuelo.length} en Curso
          </div>
          <span className="font-mono-code text-xs text-amber-700">
            Estados: En Abordaje / En Vuelo
          </span>
        </div>

        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Asignación de Recursos
            </span>
            <span className="material-symbols-outlined text-emerald-600">door_sliding</span>
          </div>
          <div className="text-3xl font-bold text-[#18181B] my-2">
            {avionesAsignadosUnicos} Aeronaves
          </div>
          <span className="font-mono-code text-xs text-emerald-700">
            {puertasLibres} Puertas (Gates) Disponibles
          </span>
        </div>
      </div>

      {/* Barra de Filtros Rápidos FIDS */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTerminalId}
              onChange={(e) => setSelectedTerminalId(e.target.value)}
              className="h-9 px-3 rounded border border-zinc-300 bg-white text-xs font-medium outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">Todas las Terminales</option>
              {terminales.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.codigo} — {t.nombre}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar vuelo (AM-104), IATA o matrícula..."
              className="w-64 h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'Programado', 'En Abordaje', 'En Vuelo', 'Retrasado'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedEstado(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  selectedEstado === st
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {st === 'ALL' ? 'Todos' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Tablero FIDS Principal */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Vuelo</th>
              <th className="py-2.5 px-4 font-semibold">Trayecto (IATA)</th>
              <th className="py-2.5 px-4 font-semibold">Aeronave / Matrícula</th>
              <th className="py-2.5 px-4 font-semibold">Puerta (Gate)</th>
              <th className="py-2.5 px-4 font-semibold">Horario (Salida → Llegada)</th>
              <th className="py-2.5 px-4 font-semibold text-right">Estado FIDS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {filteredVuelos.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Consultando vuelos en vivo...'
                    : 'No hay vuelos registrados en la base de datos que coincidan con el filtro.'}
                </td>
              </tr>
            ) : (
              filteredVuelos.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-mono-code font-bold text-[#0284C7]">
                    {v.numeroVuelo}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#18181B]">
                    {getRutaTrayecto(v.rutaId)}
                  </td>
                  <td className="py-3 px-4 font-mono-code text-zinc-700">
                    {getAvionInfo(v.avionId)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono-code font-bold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-800">
                      {getGateInfo(v.puertaEmbarqueId)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-code text-zinc-600">
                    {new Date(v.fechaHoraSalida).toLocaleString('es-PE', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}{' '}
                    →{' '}
                    {new Date(v.fechaHoraLlegada).toLocaleTimeString('es-PE', {
                      timeStyle: 'short'
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${getStatusBadge(
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
    </div>
  );
}
