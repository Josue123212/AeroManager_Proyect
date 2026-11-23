import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../api/axiosClient';
import {
  AeropuertoDto,
  PuertaEmbarqueDto,
  TerminalDto,
  VueloDto
} from '../../types/models';

export default function MonitorGatesPage() {
  const [puertas, setPuertas] = useState<PuertaEmbarqueDto[]>([]);
  const [terminales, setTerminales] = useState<TerminalDto[]>([]);
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [vuelos, setVuelos] = useState<VueloDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [aeropuertoFilter, setAeropuertoFilter] = useState<string>('ALL');
  const [terminalTab, setTerminalTab] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [pRes, tRes, aRes, vRes] = await Promise.all([
        axiosClient.get<PuertaEmbarqueDto[]>('/puertasembarque'),
        axiosClient.get<TerminalDto[]>('/terminales'),
        axiosClient.get<AeropuertoDto[]>('/aeropuertos'),
        axiosClient.get<VueloDto[]>('/vuelos')
      ]);
      setPuertas(pRes.data);
      setTerminales(tRes.data);
      setAeropuertos(aRes.data);
      setVuelos(vRes.data);
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'No se pudo cargar la información del servidor.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleChangeEstadoGate = async (item: PuertaEmbarqueDto, nuevoEstado: string) => {
    setErrorMsg(null);
    try {
      await axiosClient.put(`/puertasembarque/${item.id}`, {
        id: item.id,
        codigoGate: item.codigoGate,
        estado: nuevoEstado,
        terminalId: item.terminalId,
        activo: item.activo
      });
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'Error al cambiar estado de la puerta (Gate).'));
    }
  };

  const terminalesFiltradas = terminales.filter((t) =>
    aeropuertoFilter === 'ALL' ? true : String(t.aeropuertoId) === aeropuertoFilter
  );

  const puertasActivas = puertas.filter((p) => {
    if (!p.activo) return false;
    const term = terminales.find((t) => t.id === p.terminalId);
    if (aeropuertoFilter !== 'ALL') {
      if (!term || String(term.aeropuertoId) !== aeropuertoFilter) return false;
    }
    if (terminalTab !== 'ALL' && String(p.terminalId) !== terminalTab) return false;
    if (search.trim()) {
      return p.codigoGate.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const totalGates = puertasActivas.length;
  const disponibles = puertasActivas.filter(
    (p) => p.estado.toUpperCase() === 'DISPONIBLE'
  ).length;
  const ocupadas = puertasActivas.filter(
    (p) =>
      p.estado.toUpperCase().includes('OCUP') || p.estado.toUpperCase().includes('ABORD')
  ).length;
  const mantenimiento = puertasActivas.filter(
    (p) => p.estado.toUpperCase().includes('MANTEN')
  ).length;

  const getGateStyle = (st: string) => {
    const up = st.toUpperCase();
    if (up === 'DISPONIBLE') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (up.includes('MANTEN')) return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-amber-50 border-amber-200 text-amber-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Consola Operador de Vuelos / Control de Muelles &amp; Gates
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">
            Monitor Operativo de Puertas de Embarque (Gates)
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Estado en tiempo real de las posiciones de embarque y su asignación a vuelos activos en
            Neon Cloud PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="h-9 px-4 rounded bg-[#F4F4F5] hover:bg-zinc-200 border border-zinc-200 text-zinc-700 font-mono-code text-xs font-semibold cursor-pointer"
        >
          {loading ? 'Sincronizando...' : '↻ Actualizar Gates'}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* 4 Contadores de Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-zinc-500">Total Gates</span>
          <div className="text-2xl font-bold text-[#18181B] mt-1">{totalGates} Posiciones</div>
        </div>
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-emerald-700">Disponibles</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{disponibles} Libres</div>
        </div>
        <div className="p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-amber-700">
            Ocupadas / En Abordaje
          </span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{ocupadas} Activas</div>
        </div>
        <div className="p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-red-700">Mantenimiento</span>
          <div className="text-2xl font-bold text-red-700 mt-1">{mantenimiento} Cerradas</div>
        </div>
      </div>

      {/* Barra de Filtros por Aeropuerto, Terminal y Buscador */}
      <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={aeropuertoFilter}
            onChange={(e) => {
              setAeropuertoFilter(e.target.value);
              setTerminalTab('ALL');
            }}
            className="h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
          >
            <option value="ALL">Todos los Aeropuertos</option>
            {aeropuertos.map((a) => (
              <option key={a.id} value={String(a.id)}>
                {a.codigoIata} — {a.nombre}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setTerminalTab('ALL')}
              className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${terminalTab === 'ALL'
                  ? 'bg-[#0284C7] text-white'
                  : 'bg-[#F4F4F5] text-zinc-700 hover:bg-zinc-200'
                }`}
            >
              Todas las Terminales
            </button>
            {terminalesFiltradas.map((t) => {
              const aero = aeropuertos.find((a) => a.id === t.aeropuertoId);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTerminalTab(String(t.id))}
                  className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${terminalTab === String(t.id)
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-[#F4F4F5] text-zinc-700 hover:bg-zinc-200'
                    }`}
                >
                  {t.codigo}
                  {aero ? ` · ${aero.codigoIata}` : ''}
                </button>
              );
            })}
          </div>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar código de puerta (A12, B04)..."
          className="w-full lg:w-64 h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
        />
      </div>

      {/* Grilla de Tarjetas de Puertas (PuertaEmbarque) */}
      {puertasActivas.length === 0 ? (
        <div className="p-8 bg-white border border-zinc-200 rounded-xl text-center text-xs text-zinc-500">
          {loading
            ? 'Cargando información...'
            : 'No hay puertas de embarque registradas.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {puertasActivas.map((gate) => {
            const term = terminales.find((t) => t.id === gate.terminalId);
            const aero = term ? aeropuertos.find((a) => a.id === term.aeropuertoId) : null;
            const vueloAsignado = vuelos
              .filter((v) => {
                if (v.puertaEmbarqueId !== gate.id || !v.activo) return false;
                const up = v.estado.toUpperCase();
                return !up.includes('ATERRIZ') && !up.includes('CANCEL');
              })
              .sort(
                (a, b) =>
                  new Date(a.fechaHoraSalida).getTime() - new Date(b.fechaHoraSalida).getTime()
              )[0];
            const gateEnMantenimientoConVuelo =
              gate.estado.toUpperCase().includes('MANTEN') && Boolean(vueloAsignado);

            return (
              <div
                key={gate.id}
                className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code text-base font-bold text-[#18181B]">
                      GATE {gate.codigoGate}
                    </span>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${getGateStyle(
                        gate.estado
                      )}`}
                    >
                      {gate.estado}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {term ? `${term.codigo} — ${term.nombre}` : `Terminal #${gate.terminalId}`}
                    {aero ? ` (${aero.codigoIata})` : ''}
                  </p>

                  <div className="mt-3 p-3 rounded-lg bg-[#F4F4F5] border border-zinc-200 text-xs">
                    {vueloAsignado ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Vuelo Activo:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono-code font-bold text-[#0284C7]">
                              {vueloAsignado.numeroVuelo}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-[10px] font-semibold text-zinc-700">
                              {vueloAsignado.estado}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Salida (STD):</span>
                          <span className="font-mono-code text-zinc-700">
                            {new Date(vueloAsignado.fechaHoraSalida).toLocaleString('es-PE', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </span>
                        </div>
                        {gateEnMantenimientoConVuelo && (
                          <div className="mt-1.5 px-2 py-1 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                            Conflicto: Gate en mantenimiento con vuelo asignado.
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-500 font-mono-code">
                        Sin vuelo activo asignado
                      </span>
                    )}
                  </div>
                </div>

                {/* Botones rápidos de cambio de estado en Sistema AeroManager{id} */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-1.5">
                  {['Disponible', 'En Abordaje', 'Mantenimiento'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleChangeEstadoGate(gate, st)}
                      className={`flex-1 py-1.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${gate.estado === st
                          ? 'bg-[#0284C7] text-white'
                          : 'bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
