import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import { AsientoDto, AvionDto, ClaseAsientoDto } from '../../../types/models';

export default function AsientosPage() {
  const [asientos, setAsientos] = useState<AsientoDto[]>([]);
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [clases, setClases] = useState<ClaseAsientoDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [avionId, setAvionId] = useState<number>(1);
  const [claseAsientoId, setClaseAsientoId] = useState<number>(1);
  const [fila, setFila] = useState<number>(1);
  const [columna, setColumna] = useState('A');

  const loadData = async () => {
    try {
      const [asRes, avRes, clRes] = await Promise.all([
        axiosClient.get<AsientoDto[]>('/asientos'),
        axiosClient.get<AvionDto[]>('/aviones'),
        axiosClient.get<ClaseAsientoDto[]>('/clasesasiento')
      ]);
      setAsientos(asRes.data);
      setAviones(avRes.data);
      setClases(clRes.data);
    } catch {
      setAviones([
        { id: 1, matricula: 'OB-2150-P', estadoOperativo: 'Operativo', aerolineaId: 1, modeloAvionId: 1, activo: true },
        { id: 2, matricula: 'OB-2290-P', estadoOperativo: 'Operativo', aerolineaId: 1, modeloAvionId: 2, activo: true }
      ]);
      setClases([
        { id: 1, nombre: 'Económica', multiplicadorTarifa: 1.0, activo: true },
        { id: 3, nombre: 'Ejecutiva', multiplicadorTarifa: 2.1, activo: true }
      ]);
      setAsientos([
        { id: 1, codigoAsiento: '1A', fila: 1, columna: 'A', avionId: 1, claseAsientoId: 3, activo: true },
        { id: 2, codigoAsiento: '1B', fila: 1, columna: 'B', avionId: 1, claseAsientoId: 3, activo: true },
        { id: 3, codigoAsiento: '1C', fila: 1, columna: 'C', avionId: 1, claseAsientoId: 3, activo: true },
        { id: 4, codigoAsiento: '12A', fila: 12, columna: 'A', avionId: 1, claseAsientoId: 1, activo: true },
        { id: 5, codigoAsiento: '12B', fila: 12, columna: 'B', avionId: 1, claseAsientoId: 1, activo: true },
        { id: 6, codigoAsiento: '12F', fila: 12, columna: 'F', avionId: 1, claseAsientoId: 1, activo: true }
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUbicacionPorColumna = (col: string) => {
    const letra = col.toUpperCase();
    if (letra === 'A' || letra === 'F') return 'Ventana';
    if (letra === 'C' || letra === 'D') return 'Pasillo';
    return 'Centro';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const codigoAsiento = `${fila}${columna.toUpperCase()}`;
    try {
      await axiosClient.post('/asientos', {
        codigoAsiento,
        fila,
        columna: columna.toUpperCase(),
        avionId,
        claseAsientoId
      });
      await loadData();
    } catch {
      const nextId = asientos.length ? Math.max(...asientos.map((a) => a.id)) + 1 : 1;
      setAsientos((prev) => [
        ...prev,
        {
          id: nextId,
          codigoAsiento,
          fila,
          columna: columna.toUpperCase(),
          avionId,
          claseAsientoId,
          activo: true
        }
      ]);
    }
    setShowModal(false);
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
            Distribución física de butacas por aeronave (ubicación Ventana/Centro/Pasillo calculada automáticamente).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Registrar Asiento Físico</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F4F5] border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Código Asiento</th>
              <th className="py-2.5 px-4 font-semibold">Aeronave (Matrícula)</th>
              <th className="py-2.5 px-4 font-semibold">Fila / Columna</th>
              <th className="py-2.5 px-4 font-semibold">Ubicación Calculada</th>
              <th className="py-2.5 px-4 font-semibold">Clase Asignada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {asientos.map((item) => {
              const av = aviones.find((a) => a.id === item.avionId);
              const cl = clases.find((c) => c.id === item.claseAsientoId);
              const ubic = getUbicacionPorColumna(item.columna);
              return (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono-code font-bold px-2.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                      {item.codigoAsiento}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-code font-semibold text-[#18181B]">
                    {av ? av.matricula : `AV #${item.avionId}`}
                  </td>
                  <td className="py-3 px-4 font-mono-code text-zinc-700">
                    Fila {item.fila} • Col {item.columna}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono-code text-[11px] px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-700">
                      {ubic}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">
                    {cl ? cl.nombre : `Clase #${item.claseAsientoId}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">
                Registrar Asiento en Aeronave
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
                    Número de Fila (1-40)
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
                    Columna (A - F)
                  </label>
                  <select
                    value={columna}
                    onChange={(e) => setColumna(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs bg-white outline-none focus:border-[#0284C7]"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((col) => (
                      <option key={col} value={col}>
                        {col} ({getUbicacionPorColumna(col)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#F4F4F5] border border-zinc-200 text-xs flex items-center justify-between">
                <span className="text-zinc-600">Código Generado:</span>
                <span className="font-mono-code font-bold text-[#0284C7]">
                  {fila}
                  {columna} — {getUbicacionPorColumna(columna)}
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
