import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../../api/axiosClient';
import { AsientoDto, AvionDto, ClaseAsientoDto } from '../../../types/models';

export default function AsientosPage() {
  const [asientos, setAsientos] = useState<AsientoDto[]>([]);
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [clases, setClases] = useState<ClaseAsientoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AsientoDto | null>(null);
  const [avionId, setAvionId] = useState<number>(0);
  const [claseAsientoId, setClaseAsientoId] = useState<number>(0);
  const [fila, setFila] = useState<number>(1);
  const [letra, setLetra] = useState('A');
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [asRes, avRes, clRes] = await Promise.all([
        axiosClient.get<AsientoDto[]>('/asientos'),
        axiosClient.get<AvionDto[]>('/aviones'),
        axiosClient.get<ClaseAsientoDto[]>('/clasesasiento')
      ]);
      setAsientos(asRes.data);
      setAviones(avRes.data);
      setClases(clRes.data);
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'No se pudo cargar la información del servidor.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUbicacionPorLetra = (col: string) => {
    const ch = col.toUpperCase();
    if (ch === 'A' || ch === 'F') return 'Ventana';
    if (ch === 'C' || ch === 'D') return 'Pasillo';
    return 'Centro';
  };

  const openCreate = () => {
    setEditing(null);
    setAvionId(aviones[0]?.id || 0);
    setClaseAsientoId(clases[0]?.id || 0);
    setFila(1);
    setLetra('A');
    setActivo(true);
    setShowModal(true);
  };

  const openEdit = (item: AsientoDto) => {
    setEditing(item);
    setAvionId(item.avionId);
    setClaseAsientoId(item.claseAsientoId);
    setFila(item.fila);
    setLetra(item.letra);
    setActivo(item.activo);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editing) {
        await axiosClient.put(`/asientos/${editing.id}`, {
          id: editing.id,
          fila,
          letra: letra.toUpperCase(),
          avionId,
          claseAsientoId,
          activo
        });
      } else {
        await axiosClient.post('/asientos', {
          fila,
          letra: letra.toUpperCase(),
          avionId,
          claseAsientoId
        });
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'Error al guardar asiento.'));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Flota Aérea / Layout Físico de Cabina
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Configuración de Asientos</h1>
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
          <span>Registrar Asiento Físico</span>
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
              <th className="py-2.5 px-4 font-semibold">Asiento (Fila + Letra)</th>
              <th className="py-2.5 px-4 font-semibold">Aeronave (Matrícula)</th>
              <th className="py-2.5 px-4 font-semibold">Fila / Letra</th>
              <th className="py-2.5 px-4 font-semibold">Ubicación Calculada</th>
              <th className="py-2.5 px-4 font-semibold">Clase Asignada</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {asientos.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Cargando información...'
                    : 'No hay asientos registrados.'}
                </td>
              </tr>
            ) : (
              asientos.map((item) => {
                const av = aviones.find((a) => a.id === item.avionId);
                const cl = clases.find((c) => c.id === item.claseAsientoId);
                const ubic = getUbicacionPorLetra(item.letra);
                return (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code font-bold px-2.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                        {item.fila}
                        {item.letra}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-code font-semibold text-[#18181B]">
                      {av ? av.matricula : `AV #${item.avionId}`}
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-700">
                      Fila {item.fila} • Letra {item.letra}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code text-[11px] px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-700">
                        {ubic}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">
                      {cl ? cl.nombre : `Clase #${item.claseAsientoId}`}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">
                {editing ? 'Editar Asiento Físico' : 'Registrar Asiento en Aeronave'}
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
                  Aeronave Física
                </label>
                <select
                  required
                  value={avionId}
                  onChange={(e) => setAvionId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {aviones.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.matricula} ({a.estadoOperativo})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Clase de Asiento
                </label>
                <select
                  required
                  value={claseAsientoId}
                  onChange={(e) => setClaseAsientoId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {clases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} (x{c.multiplicadorTarifa})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Número de Fila (&gt; 0)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={fila}
                    onChange={(e) => setFila(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Letra (A - F)
                  </label>
                  <select
                    value={letra}
                    onChange={(e) => setLetra(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs bg-white outline-none focus:border-[#0284C7]"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((col) => (
                      <option key={col} value={col}>
                        {col} ({getUbicacionPorLetra(col)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#F4F4F5] border border-zinc-200 text-xs flex items-center justify-between">
                <span className="text-zinc-600">Designador Físico:</span>
                <span className="font-mono-code font-bold text-[#0284C7]">
                  {fila}
                  {letra} — {getUbicacionPorLetra(letra)}
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
                  className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold cursor-pointer"
                >
                  Guardar Asiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
