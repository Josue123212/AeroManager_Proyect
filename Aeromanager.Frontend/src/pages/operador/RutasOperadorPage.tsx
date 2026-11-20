import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { AeropuertoDto, RutaDto } from '../../types/models';

export default function RutasOperadorPage() {
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [origenFilter, setOrigenFilter] = useState<string>('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RutaDto | null>(null);
  const [codigoRuta, setCodigoRuta] = useState('');
  const [aeropuertoOrigenId, setAeropuertoOrigenId] = useState<number>(0);
  const [aeropuertoDestinoId, setAeropuertoDestinoId] = useState<number>(0);
  const [distanciaKm, setDistanciaKm] = useState<number>(580);
  const [duracionEstimadaMinutos, setDuracionEstimadaMinutos] = useState<number>(80);
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [rRes, aRes] = await Promise.all([
        axiosClient.get<RutaDto[]>('/rutas'),
        axiosClient.get<AeropuertoDto[]>('/aeropuertos')
      ]);
      setRutas(rRes.data);
      setAeropuertos(aRes.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al consultar GET /api/rutas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    const first = aeropuertos[0]?.id || 0;
    const second = aeropuertos[1]?.id || first;
    setAeropuertoOrigenId(first);
    setAeropuertoDestinoId(second);
    setCodigoRuta('');
    setDistanciaKm(580);
    setDuracionEstimadaMinutos(80);
    setActivo(true);
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEdit = (item: RutaDto) => {
    setEditing(item);
    setCodigoRuta(item.codigoRuta);
    setAeropuertoOrigenId(item.aeropuertoOrigenId);
    setAeropuertoDestinoId(item.aeropuertoDestinoId);
    setDistanciaKm(item.distanciaKm);
    setDuracionEstimadaMinutos(item.duracionEstimadaMinutos);
    setActivo(item.activo);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (aeropuertoOrigenId === aeropuertoDestinoId) {
      setErrorMsg(
        'Regla de Dominio (RutaDomainService): El aeropuerto de origen y el aeropuerto de destino no pueden ser el mismo.'
      );
      return;
    }

    try {
      if (editing) {
        await axiosClient.put(`/rutas/${editing.id}`, {
          id: editing.id,
          codigoRuta: codigoRuta.trim().toUpperCase(),
          aeropuertoOrigenId,
          aeropuertoDestinoId,
          distanciaKm,
          duracionEstimadaMinutos,
          activo
        });
      } else {
        await axiosClient.post('/rutas', {
          codigoRuta: codigoRuta.trim().toUpperCase(),
          aeropuertoOrigenId,
          aeropuertoDestinoId,
          distanciaKm,
          duracionEstimadaMinutos
        });
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          'Error al guardar la ruta aérea en la base de datos.'
      );
    }
  };

  const handleToggleActivo = async (item: RutaDto) => {
    setErrorMsg(null);
    try {
      await axiosClient.put(`/rutas/${item.id}`, {
        id: item.id,
        codigoRuta: item.codigoRuta,
        aeropuertoOrigenId: item.aeropuertoOrigenId,
        aeropuertoDestinoId: item.aeropuertoDestinoId,
        distanciaKm: item.distanciaKm,
        duracionEstimadaMinutos: item.duracionEstimadaMinutos,
        activo: !item.activo
      });
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al cambiar estado de la ruta.');
    }
  };

  const rutasActivas = rutas.filter((r) => r.activo);
  const distanciaTotalRed = rutasActivas.reduce((acc, r) => acc + r.distanciaKm, 0);
  const promedioMinutos = rutasActivas.length
    ? Math.round(
        rutasActivas.reduce((acc, r) => acc + r.duracionEstimadaMinutos, 0) / rutasActivas.length
      )
    : 0;

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m (${mins} min)`;
  };

  const velocidadMediaCalculada =
    duracionEstimadaMinutos > 0
      ? Math.round(distanciaKm / (duracionEstimadaMinutos / 60))
      : 0;

  const getAeropuertoLabel = (id: number) => {
    const a = aeropuertos.find((x) => x.id === id);
    return a ? `${a.codigoIata} — ${a.nombre}` : `Aeropuerto #${id}`;
  };

  const filtered = rutas.filter((r) => {
    if (origenFilter !== 'ALL' && String(r.aeropuertoOrigenId) !== origenFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.codigoRuta.toLowerCase().includes(q) ||
        getAeropuertoLabel(r.aeropuertoOrigenId).toLowerCase().includes(q) ||
        getAeropuertoLabel(r.aeropuertoDestinoId).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Consola Operador de Vuelos / Red de Corredores Aéreos
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Gestión de Rutas Aéreas</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Corredores comerciales origen-destino validados por RutaDomainService en Neon Cloud
            PostgreSQL.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Nueva Ruta Aérea</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* 3 Tarjetas KPI calculadas de GET /api/rutas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Corredores Activos
          </span>
          <div className="text-3xl font-bold text-[#18181B] my-1.5">
            {rutasActivas.length} Rutas
          </div>
          <span className="font-mono-code text-xs text-emerald-700">
            Habilitadas para programación
          </span>
        </div>

        <div className="p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Distancia Total Red
          </span>
          <div className="text-3xl font-bold text-[#18181B] my-1.5">
            {distanciaTotalRed.toLocaleString()} km
          </div>
          <span className="font-mono-code text-xs text-zinc-600">
            Suma acumulada de trayectos
          </span>
        </div>

        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Tiempo Promedio de Vuelo
          </span>
          <div className="text-3xl font-bold text-[#18181B] my-1.5">
            {formatDuration(promedioMinutos)}
          </div>
          <span className="font-mono-code text-xs text-[#0284C7]">
            Duración estimada media
          </span>
        </div>
      </div>

      {/* Tabla CRUD de Rutas */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código (RUT-LIM-CUZ) o aeropuerto..."
              className="w-72 h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            />
            <select
              value={origenFilter}
              onChange={(e) => setOrigenFilter(e.target.value)}
              className="h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">Todos los Orígenes</option>
              {aeropuertos.map((a) => (
                <option key={a.id} value={String(a.id)}>
                  Origen: {a.codigoIata} — {a.nombre}
                </option>
              ))}
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
              <th className="py-2.5 px-4 font-semibold">Código Ruta</th>
              <th className="py-2.5 px-4 font-semibold">Aeropuerto Origen</th>
              <th className="py-2.5 px-4 font-semibold">Aeropuerto Destino</th>
              <th className="py-2.5 px-4 font-semibold">Distancia</th>
              <th className="py-2.5 px-4 font-semibold">Duración Estimada</th>
              <th className="py-2.5 px-4 font-semibold">Estado</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Consultando GET /api/rutas...'
                    : 'No hay rutas aéreas registradas en la base de datos.'}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono-code font-bold px-2.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                      {item.codigoRuta}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#18181B]">
                    {getAeropuertoLabel(item.aeropuertoOrigenId)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#18181B]">
                    {getAeropuertoLabel(item.aeropuertoDestinoId)}
                  </td>
                  <td className="py-3 px-4 font-mono-code text-zinc-700">
                    {item.distanciaKm.toLocaleString()} km
                  </td>
                  <td className="py-3 px-4 font-mono-code text-zinc-700">
                    {formatDuration(item.duracionEstimadaMinutos)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                        item.activo
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      {item.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="px-2.5 py-1 rounded bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700 font-medium cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActivo(item)}
                      className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-medium cursor-pointer"
                    >
                      {item.activo ? 'Desactivar' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Crear / Editar Ruta Aérea */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">
                {editing ? 'Editar Ruta Aérea' : 'Registrar Nueva Ruta Aérea'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Regla de Integridad de Dominio */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <strong>REGLA DE INTEGRIDAD DE VUELO (RutaDomainService):</strong> El aeropuerto de
                origen y el aeropuerto de destino deben ser estrictamente distintos (`Origen ≠ Destino`).
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Código de Ruta (Ej. RUT-LIM-CUZ)
                </label>
                <input
                  type="text"
                  required
                  value={codigoRuta}
                  onChange={(e) => setCodigoRuta(e.target.value.toUpperCase())}
                  placeholder="RUT-LIM-CUZ"
                  className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs uppercase outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Aeropuerto de Origen (IATA)
                  </label>
                  <select
                    required
                    value={aeropuertoOrigenId}
                    onChange={(e) => setAeropuertoOrigenId(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                  >
                    {aeropuertos.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.codigoIata} — {a.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Aeropuerto de Destino (IATA)
                  </label>
                  <select
                    required
                    value={aeropuertoDestinoId}
                    onChange={(e) => setAeropuertoDestinoId(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                  >
                    {aeropuertos.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.codigoIata} — {a.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Distancia en Kilómetros (&gt; 0)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={distanciaKm}
                    onChange={(e) => setDistanciaKm(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Duración Estimada (Minutos &gt; 0)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={duracionEstimadaMinutos}
                    onChange={(e) => setDuracionEstimadaMinutos(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              {/* Barra gris de velocidad media calculada en vivo */}
              <div className="p-2.5 rounded bg-[#F4F4F5] border border-zinc-200 text-xs flex items-center justify-between">
                <span className="text-zinc-600">Velocidad media calculada:</span>
                <span className="font-mono-code font-bold text-[#0284C7]">
                  {velocidadMediaCalculada} km/h ({formatDuration(duracionEstimadaMinutos)})
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-9 px-4 rounded bg-[#F4F4F5] text-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={aeropuertoOrigenId === aeropuertoDestinoId}
                  className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Guardar Ruta Aérea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
