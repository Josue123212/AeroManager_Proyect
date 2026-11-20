import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import { AeropuertoDto, TerminalDto } from '../../../types/models';

export default function TerminalesPage() {
  const [terminales, setTerminales] = useState<TerminalDto[]>([]);
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TerminalDto | null>(null);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [aeropuertoId, setAeropuertoId] = useState<number>(1);
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    try {
      const [tRes, aRes] = await Promise.all([
        axiosClient.get<TerminalDto[]>('/terminales'),
        axiosClient.get<AeropuertoDto[]>('/aeropuertos')
      ]);
      setTerminales(tRes.data);
      setAeropuertos(aRes.data);
    } catch {
      setAeropuertos([
        { id: 1, nombre: 'Jorge Chávez (Lima)', codigoIata: 'LIM', ciudadId: 1, activo: true },
        { id: 2, nombre: 'Velasco Astete (Cusco)', codigoIata: 'CUZ', ciudadId: 2, activo: true },
        { id: 4, nombre: 'El Dorado (Bogotá)', codigoIata: 'BOG', ciudadId: 4, activo: true }
      ]);
      setTerminales([
        { id: 1, codigo: 'T1', nombre: 'Terminal Nacional e Internacional 1', aeropuertoId: 1, activo: true },
        { id: 2, codigo: 'T2', nombre: 'Nueva Terminal Internacional Hub LIM', aeropuertoId: 1, activo: true },
        { id: 3, codigo: 'T-CUZ', nombre: 'Terminal Principal Cusco', aeropuertoId: 2, activo: true },
        { id: 4, codigo: 'T1-BOG', nombre: 'Terminal Internacional El Dorado', aeropuertoId: 4, activo: true }
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setCodigo('');
    setNombre('');
    setAeropuertoId(aeropuertos[0]?.id || 1);
    setActivo(true);
    setShowModal(true);
  };

  const openEdit = (item: TerminalDto) => {
    setEditing(item);
    setCodigo(item.codigo);
    setNombre(item.nombre);
    setAeropuertoId(item.aeropuertoId);
    setActivo(item.activo);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await axiosClient.put(`/terminales/${editing.id}`, {
          id: editing.id,
          codigo,
          nombre,
          aeropuertoId,
          activo
        });
      } else {
        await axiosClient.post('/terminales', { codigo, nombre, aeropuertoId });
      }
      await loadData();
    } catch {
      if (editing) {
        setTerminales((prev) =>
          prev.map((t) =>
            t.id === editing.id ? { ...t, codigo, nombre, aeropuertoId, activo } : t
          )
        );
      } else {
        const nextId = terminales.length ? Math.max(...terminales.map((t) => t.id)) + 1 : 1;
        setTerminales((prev) => [
          ...prev,
          { id: nextId, codigo, nombre, aeropuertoId, activo: true }
        ]);
      }
    }
    setShowModal(false);
  };

  const getAeropuertoLabel = (id: number) => {
    const a = aeropuertos.find((x) => x.id === id);
    return a ? `${a.codigoIata} — ${a.nombre}` : `Aeropuerto #${id}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Infraestructura Aeroportuaria / Terminales
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Terminales Aeroportuarias</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Edificios terminales asociados a cada sede IATA para agrupación de puertas de embarque.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Registrar Nueva Terminal</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F4F5] border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Código Terminal</th>
              <th className="py-2.5 px-4 font-semibold">Nombre de la Terminal</th>
              <th className="py-2.5 px-4 font-semibold">Aeropuerto Asociado</th>
              <th className="py-2.5 px-4 font-semibold">Estado</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {terminales.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50">
                <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                <td className="py-3 px-4">
                  <span className="font-mono-code font-bold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-800">
                    {item.codigo}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-[#18181B]">{item.nombre}</td>
                <td className="py-3 px-4 text-zinc-700">
                  {getAeropuertoLabel(item.aeropuertoId)}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold bg-emerald-50 border-emerald-200 text-emerald-700">
                    {item.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="px-2.5 py-1 rounded bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700 font-medium cursor-pointer"
                  >
                    Editar
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
                {editing ? 'Editar Terminal' : 'Registrar Nueva Terminal Aeroportuaria'}
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
                  Aeropuerto Asociado
                </label>
                <select
                  value={aeropuertoId}
                  onChange={(e) => setAeropuertoId(Number(e.target.value))}
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
                  Código (Ej. T1, T2)
                </label>
                <input
                  type="text"
                  required
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="T1"
                  className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs uppercase outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Nombre de la Terminal
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Terminal Nacional"
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
                  Guardar Terminal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
