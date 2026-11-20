import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import { PaisDto } from '../../../types/models';

export default function PaisesPage() {
  const [paises, setPaises] = useState<PaisDto[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PaisDto | null>(null);
  const [nombre, setNombre] = useState('');
  const [codigoIso, setCodigoIso] = useState('');
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    try {
      const res = await axiosClient.get<PaisDto[]>('/paises');
      setPaises(res.data);
    } catch {
      setPaises([
        { id: 1, nombre: 'Perú', codigoIso: 'PER', activo: true },
        { id: 2, nombre: 'Colombia', codigoIso: 'COL', activo: true },
        { id: 3, nombre: 'Chile', codigoIso: 'CHL', activo: true },
        { id: 4, nombre: 'Estados Unidos', codigoIso: 'USA', activo: true },
        { id: 5, nombre: 'España', codigoIso: 'ESP', activo: true }
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setNombre('');
    setCodigoIso('');
    setActivo(true);
    setShowModal(true);
  };

  const openEdit = (item: PaisDto) => {
    setEditing(item);
    setNombre(item.nombre);
    setCodigoIso(item.codigoIso);
    setActivo(item.activo);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const iso = codigoIso.trim().toUpperCase().slice(0, 3);
    try {
      if (editing) {
        await axiosClient.put(`/paises/${editing.id}`, {
          id: editing.id,
          nombre,
          codigoIso: iso,
          activo
        });
      } else {
        await axiosClient.post('/paises', { nombre, codigoIso: iso });
      }
      await loadData();
    } catch {
      if (editing) {
        setPaises((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, nombre, codigoIso: iso, activo } : p))
        );
      } else {
        const nextId = paises.length ? Math.max(...paises.map((p) => p.id)) + 1 : 1;
        setPaises((prev) => [...prev, { id: nextId, nombre, codigoIso: iso, activo: true }]);
      }
    }
    setShowModal(false);
  };

  const handleToggleActivo = async (item: PaisDto) => {
    const updated = { ...item, activo: !item.activo };
    try {
      await axiosClient.put(`/paises/${item.id}`, updated);
      await loadData();
    } catch {
      setPaises((prev) => prev.map((p) => (p.id === item.id ? updated : p)));
    }
  };

  const filtered = paises.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigoIso.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Catálogos Globales / Países
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Catálogo de Países (ISO-3166)</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Jurisdicciones soberanas para sedes aeroportuarias, aerolíneas y nacionalidad de pasajeros.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Registrar Nuevo País</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2 text-zinc-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por país o código ISO (PER, COL)..."
              className="w-full h-9 pl-9 pr-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            />
          </div>
          <span className="font-mono-code text-xs text-zinc-600">
            Total registros: <strong>{filtered.length}</strong>
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Código ISO (3 Letras)</th>
              <th className="py-2.5 px-4 font-semibold">Nombre Oficial del País</th>
              <th className="py-2.5 px-4 font-semibold">Estado</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50">
                <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                <td className="py-3 px-4">
                  <span className="font-mono-code font-bold px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                    {item.codigoIso}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-[#18181B]">{item.nombre}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">
                {editing ? 'Editar País' : 'Registrar Nuevo País'}
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
                  Nombre del País
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Perú"
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Código ISO (3 Caracteres)
                </label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={codigoIso}
                  onChange={(e) => setCodigoIso(e.target.value.toUpperCase())}
                  placeholder="Ej. PER"
                  className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs uppercase outline-none focus:border-[#0284C7]"
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
                  Guardar País
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
