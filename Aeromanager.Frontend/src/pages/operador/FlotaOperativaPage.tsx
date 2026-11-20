import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import {
  AerolineaDto,
  AvionDto,
  ModeloAvionDto,
  VueloDto
} from '../../types/models';

export default function FlotaOperativaPage() {
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [aerolineas, setAerolineas] = useState<AerolineaDto[]>([]);
  const [modelos, setModelos] = useState<ModeloAvionDto[]>([]);
  const [vuelos, setVuelos] = useState<VueloDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [modeloFilter, setModeloFilter] = useState<string>('ALL');
  const [estadoFilter, setEstadoFilter] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [avRes, aeRes, moRes, vuRes] = await Promise.all([
        axiosClient.get<AvionDto[]>('/aviones'),
        axiosClient.get<AerolineaDto[]>('/aerolineas'),
        axiosClient.get<ModeloAvionDto[]>('/modelosavion'),
        axiosClient.get<VueloDto[]>('/vuelos')
      ]);
      setAviones(avRes.data);
      setAerolineas(aeRes.data);
      setModelos(moRes.data);
      setVuelos(vuRes.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al consultar GET /api/aviones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const avionesActivos = aviones.filter((a) => a.activo);
  const operativas = avionesActivos.filter(
    (a) => a.estadoOperativo.toUpperCase() === 'OPERATIVO'
  ).length;
  const enMantenimiento = avionesActivos.filter((a) =>
    a.estadoOperativo.toUpperCase().includes('MANTEN')
  ).length;
  const avionesConVueloActivo = new Set(
    vuelos.filter((v) => v.activo && v.estado.toUpperCase() !== 'CANCELADO').map((v) => v.avionId)
  ).size;

  const filtered = avionesActivos.filter((av) => {
    if (modeloFilter !== 'ALL' && String(av.modeloAvionId) !== modeloFilter) return false;
    if (estadoFilter !== 'ALL' && av.estadoOperativo.toUpperCase() !== estadoFilter.toUpperCase())
      return false;
    if (search.trim()) {
      return av.matricula.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Consola Operador de Vuelos / Disponibilidad de Aeronaves
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">
            Disponibilidad de Flota Operativa
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Consulta de matrículas tail-number, capacidad física y asignación de vuelos en Neon
            Cloud PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="h-9 px-4 rounded bg-[#F4F4F5] hover:bg-zinc-200 border border-zinc-200 text-zinc-700 font-mono-code text-xs font-semibold cursor-pointer"
        >
          {loading ? 'Consultando...' : '↻ Refrescar Flota'}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* 3 KPIs Reales calculados desde GET /api/aviones y GET /api/vuelos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Aeronaves Operativas
          </span>
          <div className="text-3xl font-bold text-[#18181B] my-1.5">
            {operativas} Aviones
          </div>
          <span className="font-mono-code text-xs text-zinc-500">
            Listas para despacho comercial
          </span>
        </div>

        <div className="p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Asignadas a Vuelos Activos
          </span>
          <div className="text-3xl font-bold text-[#18181B] my-1.5">
            {avionesConVueloActivo} en Servicio
          </div>
          <span className="font-mono-code text-xs text-zinc-600">
            Cruzado con tabla Vuelo
          </span>
        </div>

        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            En Mantenimiento / Hangar
          </span>
          <div className="text-3xl font-bold text-[#18181B] my-1.5">
            {enMantenimiento} Aeronaves
          </div>
          <span className="font-mono-code text-xs text-amber-700">
            No disponibles para programación
          </span>
        </div>
      </div>

      {/* Tabla de Flota Operativa */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar matrícula (OB-2150)..."
              className="w-60 h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            />

            <select
              value={modeloFilter}
              onChange={(e) => setModeloFilter(e.target.value)}
              className="h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">Todos los Modelos</option>
              {modelos.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.fabricante} {m.nombreModelo}
                </option>
              ))}
            </select>

            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="Operativo">Operativo</option>
              <option value="EnMantenimiento">EnMantenimiento</option>
            </select>
          </div>
          <span className="font-mono-code text-xs text-zinc-600">
            Total en BD: <strong>{filtered.length}</strong>
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Matrícula</th>
              <th className="py-2.5 px-4 font-semibold">Aerolínea</th>
              <th className="py-2.5 px-4 font-semibold">Modelo de Avión</th>
              <th className="py-2.5 px-4 font-semibold">Capacidad Física</th>
              <th className="py-2.5 px-4 font-semibold">Vuelo Asignado Activo</th>
              <th className="py-2.5 px-4 font-semibold text-right">Estado Operativo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Consultando GET /api/aviones...'
                    : 'No hay aeronaves registradas en la base de datos.'}
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const aero = aerolineas.find((a) => a.id === item.aerolineaId);
                const mod = modelos.find((m) => m.id === item.modeloAvionId);
                const vueloAsignado = vuelos.find(
                  (v) => v.avionId === item.id && v.activo && v.estado.toUpperCase() !== 'CANCELADO'
                );
                return (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                    <td className="py-3 px-4 font-mono-code font-bold text-[#0284C7]">
                      {item.matricula}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#18181B]">
                      {aero ? `${aero.nombre} (${aero.codigoIata})` : `Aerolínea #${item.aerolineaId}`}
                    </td>
                    <td className="py-3 px-4 text-zinc-700">
                      {mod
                        ? `${mod.fabricante} ${mod.nombreModelo} (${mod.autonomiaKm.toLocaleString()} km)`
                        : `Modelo #${item.modeloAvionId}`}
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-700">
                      {item.capacidadFisica} PAX
                    </td>
                    <td className="py-3 px-4 font-mono-code">
                      {vueloAsignado ? (
                        <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7] font-bold">
                          {vueloAsignado.numeroVuelo} ({vueloAsignado.estado})
                        </span>
                      ) : (
                        <span className="text-zinc-400">Sin vuelo asignado</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                          item.estadoOperativo.toUpperCase() === 'OPERATIVO'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        {item.estadoOperativo}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
