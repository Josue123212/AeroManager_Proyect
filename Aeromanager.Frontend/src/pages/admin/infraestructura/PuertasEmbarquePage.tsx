import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import { PuertaEmbarqueDto, TerminalDto } from '../../../types/models';

export default function PuertasEmbarquePage() {
  const [puertas, setPuertas] = useState<PuertaEmbarqueDto[]>([]);
  const [terminales, setTerminales] = useState<TerminalDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PuertaEmbarqueDto | null>(null);
  const [codigoGate, setCodigoGate] = useState('');
  const [estado, setEstado] = useState('Disponible');
  const [terminalId, setTerminalId] = useState<number>(1);
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        axiosClient.get<PuertaEmbarqueDto[]>('/puertasembarque'),
        axiosClient.get<TerminalDto[]>('/terminales')
      ]);
      setPuertas(pRes.data);
      setTerminales(tRes.data);
    } catch {
      setTerminales([
        { id: 1, codigo: 'T1', nombre: 'Terminal Nacional e Internacional 1 (LIM)', aeropuertoId: 1, activo: true },
        { id: 2, codigo: 'T2', nombre: 'Nueva Terminal Internacional Hub LIM', aeropuertoId: 1, activo: true },
        { id: 3, codigo: 'T-CUZ', nombre: 'Terminal Principal Cusco', aeropuertoId: 2, activo: true }
      ]);
      setPuertas([
        { id: 1, codigoGate: 'A12', estado: 'Disponible', terminalId: 1, activo: true },
        { id: 2, codigoGate: 'A14', estado: 'En Abordaje', terminalId: 1, activo: true },
        { id: 3, codigoGate: 'B04', estado: 'Disponible', terminalId: 2, activo: true },
        { id: 4, codigoGate: 'C02', estado: 'Mantenimiento', terminalId: 3, activo: true }
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setCodigoGate('');
    setEstado('Disponible');
    setTerminalId(terminales[0]?.id || 1);
    setActivo(true);
    setShowModal(true);
  };

  const openEdit = (item: PuertaEmbarqueDto) => {
    setEditing(item);
    setCodigoGate(item.codigoGate);
    setEstado(item.estado);
    setTerminalId(item.terminalId);
    setActivo(item.activo);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await axiosClient.put(`/puertasembarque/${editing.id}`, {
          id: editing.id,
          codigoGate,
          estado,
          terminalId,
          activo
        });
      } else {
        await axiosClient.post('/puertasembarque', { codigoGate, estado, terminalId });
      }
      await loadData();
    } catch {
      if (editing) {
        setPuertas((prev) =>
          prev.map((p) =>
            p.id === editing.id ? { ...p, codigoGate, estado, terminalId, activo } : p
          )
        );
      } else {
        const nextId = puertas.length ? Math.max(...puertas.map((p) => p.id)) + 1 : 1;
        setPuertas((prev) => [
          ...prev,
          { id: nextId, codigoGate, estado, terminalId, activo: true }
        ]);
      }
    }
    setShowModal(false);
  };

  const getTerminalLabel = (id: number) => {
    const t = terminales.find((x) => x.id === id);
    return t ? `${t.codigo} — ${t.nombre}` : `Terminal #${id}`;
  };

  const getGateBadge = (st: string) => {
    if (st === 'Disponible') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (st === 'Mantenimiento') return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-amber-50 border-amber-200 text-amber-700';
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Infraestructura Aeroportuaria / Gates
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Puertas de Embarque (Gates)</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Posiciones de embarque asociadas a terminales para asignación operativa de vuelos.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Registrar Puerta de Embarque</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F4F5] border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Código Gate</th>
              <th className="py-2.5 px-4 font-semibold">Terminal Asociada</th>
              <th className="py-2.5 px-4 font-semibold">Estado Operativo</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {puertas.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50">
                <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                <td className="py-3 px-4">
                  <span className="font-mono-code font-bold px-2.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                    GATE {item.codigoGate}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-[#18181B]">
                  {getTerminalLabel(item.terminalId)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${getGateBadge(
                      item.estado
                    )}`}
                  >
                    {item.estado}
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
                {editing ? 'Editar Puerta de Embarque' : 'Registrar Puerta de Embarque'}
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
                  Terminal Asociada
                </label>
                <select
                  value={terminalId}
                  onChange={(e) => setTerminalId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {terminales.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.codigo} — {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Código de Gate (Ej. A12, B04)
                </label>
                <input
                  type="text"
                  required
                  value={codigoGate}
                  onChange={(e) => setCodigoGate(e.target.value.toUpperCase())}
                  placeholder="A12"
                  className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs uppercase outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Estado Operativo Inicial
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En Abordaje">En Abordaje</option>
                  <option value="Mantenimiento">Mantenimiento</option>
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
                  Guardar Gate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
