import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../../api/axiosClient';
import { AeropuertoDto, CiudadDto } from '../../../types/models';

export default function AeropuertosPage() {
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [ciudades, setCiudades] = useState<CiudadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AeropuertoDto | null>(null);
  const [nombre, setNombre] = useState('');
  const [codigoIata, setCodigoIata] = useState('');
  const [ciudadId, setCiudadId] = useState<number>(0);
  const [direccion, setDireccion] = useState('');
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [aRes, cRes] = await Promise.all([
        axiosClient.get<AeropuertoDto[]>('/aeropuertos'),
        axiosClient.get<CiudadDto[]>('/ciudades')
      ]);
      setAeropuertos(aRes.data);
      setCiudades(cRes.data);
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'No se pudo cargar la información del servidor.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setNombre('');
    setCodigoIata('');
    setCiudadId(ciudades[0]?.id || 0);
    setDireccion('');
    setActivo(true);
    setShowModal(true);
  };

  const openEdit = (item: AeropuertoDto) => {
    setEditing(item);
    setNombre(item.nombre);
    setCodigoIata(item.codigoIata);
    setCiudadId(item.ciudadId);
    setDireccion(item.direccion || '');
    setActivo(item.activo);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const iata = codigoIata.trim().toUpperCase().slice(0, 3);
    try {
      if (editing) {
        await axiosClient.put(`/aeropuertos/${editing.id}`, {
          id: editing.id,
          nombre,
          codigoIata: iata,
          ciudadId,
          direccion,
          activo
        });
      } else {
        await axiosClient.post('/aeropuertos', {
          nombre,
          codigoIata: iata,
          ciudadId,
          direccion
        });
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'Error al guardar aeropuerto.'));
    }
  };

  const handleToggleActivo = async (item: AeropuertoDto) => {
    setErrorMsg(null);
    try {
      await axiosClient.put(`/aeropuertos/${item.id}`, {
        id: item.id,
        nombre: item.nombre,
        codigoIata: item.codigoIata,
        ciudadId: item.ciudadId,
        direccion: item.direccion || '',
        activo: !item.activo
      });
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'Error al actualizar estado del aeropuerto.'));
    }
  };

  const getCiudadNombre = (id: number) =>
    ciudades.find((c) => c.id === id)?.nombre || `Ciudad #${id}`;

  const filtered = aeropuertos.filter(
    (a) =>
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.codigoIata.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Infraestructura Aeroportuaria / Sedes IATA
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Sedes Aeroportuarias IATA</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Registros en vivo.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Registrar Sede Aeroportuaria</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código IATA (LIM, CUZ) o nombre..."
            className="w-full sm:w-80 h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
          />
          <span className="font-mono-code text-xs text-zinc-600">
            Sedes: <strong>{filtered.length}</strong>
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Código IATA</th>
              <th className="py-2.5 px-4 font-semibold">Nombre del Aeropuerto</th>
              <th className="py-2.5 px-4 font-semibold">Ciudad</th>
              <th className="py-2.5 px-4 font-semibold">Dirección Física</th>
              <th className="py-2.5 px-4 font-semibold">Estado</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Cargando información...'
                    : 'No hay aeropuertos registrados.'}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono-code font-bold px-2.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                      {item.codigoIata}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#18181B]">{item.nombre}</td>
                  <td className="py-3 px-4 text-zinc-700">{getCiudadNombre(item.ciudadId)}</td>
                  <td className="py-3 px-4 text-zinc-500">{item.direccion || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                        item.activo
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      {item.activo ? 'Operativo' : 'Inactivo'}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">
                {editing ? 'Editar Sede Aeroportuaria' : 'Registrar Nueva Sede Aeroportuaria'}
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
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Nombre Oficial del Aeropuerto
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Aeropuerto Internacional Jorge Chávez"
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-[#0284C7]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Código IATA (3 Letras)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={codigoIata}
                    onChange={(e) => setCodigoIata(e.target.value.toUpperCase())}
                    placeholder="LIM"
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs uppercase outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Ciudad Asignada
                  </label>
                  <select
                    required
                    value={ciudadId}
                    onChange={(e) => setCiudadId(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                  >
                    {ciudades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Dirección Física
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Av. Elmer Faucett s/n, Callao"
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-[#0284C7]"
                />
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
                  className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold cursor-pointer"
                >
                  Guardar Aeropuerto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
