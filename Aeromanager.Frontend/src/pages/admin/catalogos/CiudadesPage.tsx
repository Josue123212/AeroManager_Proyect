import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../../api/axiosClient';
import { CiudadDto, PaisDto } from '../../../types/models';
import { notifyError, notifySuccess, notifyUndo } from '../../../utils/notify';

export default function CiudadesPage() {
  const [ciudades, setCiudades] = useState<CiudadDto[]>([]);
  const [paises, setPaises] = useState<PaisDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CiudadDto | null>(null);
  const [nombre, setNombre] = useState('');
  const [paisId, setPaisId] = useState<number>(0);
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [cRes, pRes] = await Promise.all([
        axiosClient.get<CiudadDto[]>('/ciudades'),
        axiosClient.get<PaisDto[]>('/paises')
      ]);
      setCiudades(cRes.data);
      setPaises(pRes.data);
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
    setPaisId(paises.find((p) => p.activo)?.id || 0);
    setActivo(true);
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEdit = (item: CiudadDto) => {
    setEditing(item);
    setNombre(item.nombre);
    setPaisId(item.paisId);
    setActivo(item.activo);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editing) {
        await axiosClient.put(`/ciudades/${editing.id}`, {
          id: editing.id,
          nombre,
          paisId,
          activo
        });
        notifySuccess('Ciudad actualizada', `${nombre} se actualizó correctamente.`);
      } else {
        await axiosClient.post('/ciudades', { nombre, paisId });
        notifySuccess('Ciudad registrada', `${nombre} fue añadida al catálogo.`);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      notifyError('No se pudo guardar la ciudad', extractApiError(err, 'Error al guardar ciudad.'));
    }
  };

  const handleToggleActivo = async (item: CiudadDto) => {
    setErrorMsg(null);
    const nextActivo = !item.activo;
    try {
      await axiosClient.put(`/ciudades/${item.id}`, {
        id: item.id,
        nombre: item.nombre,
        paisId: item.paisId,
        activo: nextActivo
      });
      await loadData();
      if (!nextActivo) {
        notifyUndo('Ciudad desactivada', `${item.nombre} fue marcada como inactiva.`, async () => {
          await axiosClient.put(`/ciudades/${item.id}`, {
            id: item.id,
            nombre: item.nombre,
            paisId: item.paisId,
            activo: true
          });
          await loadData();
          notifySuccess('Ciudad reactivada', `${item.nombre} está activa nuevamente.`);
        });
      } else {
        notifySuccess('Ciudad reactivada', `${item.nombre} está activa nuevamente.`);
      }
    } catch (err: any) {
      notifyError('Error al actualizar estado', extractApiError(err, 'Error al actualizar estado de la ciudad.'));
    }
  };

  const getPaisNombre = (id: number) => {
    const p = paises.find((x) => x.id === id);
    return p ? `${p.nombre} (${p.codigoIso})` : `País #${id}`;
  };

  const filtered = ciudades.filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Catálogos Globales / Ciudades
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Catálogo de Ciudades</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Localidades geográficas vinculadas.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Registrar Nueva Ciudad</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ciudad..."
            className="w-full sm:w-80 h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
          />
          <span className="font-mono-code text-xs text-zinc-600">
            Total: <strong>{filtered.length}</strong>
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Nombre de la Ciudad</th>
              <th className="py-2.5 px-4 font-semibold">País Asociado</th>
              <th className="py-2.5 px-4 font-semibold">Estado</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  {loading ? 'Cargando información...' : 'No hay ciudades registradas.'}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                  <td className="py-3 px-4 font-semibold text-[#18181B]">{item.nombre}</td>
                  <td className="py-3 px-4 text-zinc-700">{getPaisNombre(item.paisId)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                        item.activo
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      {item.activo ? 'Activo' : 'Inactivo'}
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
                {editing ? 'Editar Ciudad' : 'Registrar Nueva Ciudad'}
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
                  Nombre de la Ciudad
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Cusco"
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  País Asociado
                </label>
                <select
                  required
                  value={paisId}
                  onChange={(e) => setPaisId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {paises
                    .filter((p) => p.activo || (editing && p.id === editing.paisId))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.codigoIso})
                      </option>
                    ))}
                </select>
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
                  Guardar Ciudad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
