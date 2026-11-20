import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../../api/axiosClient';
import { ClaseAsientoDto } from '../../../types/models';

export default function ClasesAsientoPage() {
  const [clases, setClases] = useState<ClaseAsientoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClaseAsientoDto | null>(null);
  const [nombre, setNombre] = useState('');
  const [multiplicadorTarifa, setMultiplicadorTarifa] = useState<number>(1.0);
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axiosClient.get<ClaseAsientoDto[]>('/clasesasiento');
      setClases(res.data);
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
    setMultiplicadorTarifa(1.0);
    setActivo(true);
    setShowModal(true);
  };

  const openEdit = (item: ClaseAsientoDto) => {
    setEditing(item);
    setNombre(item.nombre);
    setMultiplicadorTarifa(item.multiplicadorTarifa);
    setActivo(item.activo);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editing) {
        await axiosClient.put(`/clasesasiento/${editing.id}`, {
          id: editing.id,
          nombre,
          multiplicadorTarifa,
          activo
        });
      } else {
        await axiosClient.post('/clasesasiento', { nombre, multiplicadorTarifa });
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'Error al guardar clase de asiento.'));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Flota Aérea / Tarifario de Cabina
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Clases de Asiento</h1>
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
          <span>Registrar Clase de Asiento</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F4F5] border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Nombre de la Clase</th>
              <th className="py-2.5 px-4 font-semibold">Multiplicador de Tarifa</th>
              <th className="py-2.5 px-4 font-semibold">Simulación (Base $100 USD)</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {clases.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Cargando información...'
                    : 'No hay clases de asiento registradas.'}
                </td>
              </tr>
            ) : (
              clases.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                  <td className="py-3 px-4 font-semibold text-[#18181B]">{item.nombre}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono-code font-bold px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                      x{item.multiplicadorTarifa.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-code text-emerald-700 font-semibold">
                    ${(100 * item.multiplicadorTarifa).toFixed(2)} USD
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
                {editing ? 'Editar Clase de Asiento' : 'Registrar Clase de Asiento'}
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
                  Nombre de la Clase (Ej. Ejecutiva, Económica)
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ejecutiva"
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Multiplicador de Tarifa (&gt;= 1.00)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min={1.0}
                  required
                  value={multiplicadorTarifa}
                  onChange={(e) => setMultiplicadorTarifa(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
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
                  Guardar Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
