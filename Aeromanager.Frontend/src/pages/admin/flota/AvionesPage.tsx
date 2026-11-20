import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import { AerolineaDto, AvionDto, ModeloAvionDto } from '../../../types/models';

export default function AvionesPage() {
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [aerolineas, setAerolineas] = useState<AerolineaDto[]>([]);
  const [modelos, setModelos] = useState<ModeloAvionDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AvionDto | null>(null);
  const [matricula, setMatricula] = useState('');
  const [aerolineaId, setAerolineaId] = useState<number>(1);
  const [modeloAvionId, setModeloAvionId] = useState<number>(1);
  const [estadoOperativo, setEstadoOperativo] = useState('Operativo');
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    try {
      const [avRes, aeRes, moRes] = await Promise.all([
        axiosClient.get<AvionDto[]>('/aviones'),
        axiosClient.get<AerolineaDto[]>('/aerolineas'),
        axiosClient.get<ModeloAvionDto[]>('/modelosavion')
      ]);
      setAviones(avRes.data);
      setAerolineas(aeRes.data);
      setModelos(moRes.data);
    } catch {
      setAerolineas([
        { id: 1, nombre: 'LATAM Airlines Perú', codigoIata: 'LA', paisOrigenId: 1, activo: true },
        { id: 2, nombre: 'Sky Airline Perú', codigoIata: 'H2', paisOrigenId: 3, activo: true },
        { id: 3, nombre: 'Avianca Airlines', codigoIata: 'AV', paisOrigenId: 2, activo: true }
      ]);
      setModelos([
        { id: 1, fabricante: 'Airbus', nombreModelo: 'A320neo', capacidadTotal: 180, alcanceKm: 6300, activo: true },
        { id: 2, fabricante: 'Boeing', nombreModelo: '737 MAX 8', capacidadTotal: 189, alcanceKm: 6570, activo: true },
        { id: 3, fabricante: 'Boeing', nombreModelo: '787-9 Dreamliner', capacidadTotal: 290, alcanceKm: 14140, activo: true }
      ]);
      setAviones([
        { id: 1, matricula: 'OB-2150-P', estadoOperativo: 'Operativo', aerolineaId: 1, modeloAvionId: 1, activo: true },
        { id: 2, matricula: 'OB-2290-P', estadoOperativo: 'Operativo', aerolineaId: 1, modeloAvionId: 2, activo: true },
        { id: 3, matricula: 'CC-BGA', estadoOperativo: 'Operativo', aerolineaId: 2, modeloAvionId: 3, activo: true },
        { id: 4, matricula: 'N784AV', estadoOperativo: 'Mantenimiento', aerolineaId: 3, modeloAvionId: 1, activo: true }
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setMatricula('');
    setAerolineaId(aerolineas[0]?.id || 1);
    setModeloAvionId(modelos[0]?.id || 1);
    setEstadoOperativo('Operativo');
    setActivo(true);
    setShowModal(true);
  };

  const openEdit = (item: AvionDto) => {
    setEditing(item);
    setMatricula(item.matricula);
    setAerolineaId(item.aerolineaId);
    setModeloAvionId(item.modeloAvionId);
    setEstadoOperativo(item.estadoOperativo);
    setActivo(item.activo);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await axiosClient.put(`/aviones/${editing.id}`, {
          id: editing.id,
          matricula,
          estadoOperativo,
          aerolineaId,
          modeloAvionId,
          activo
        });
      } else {
        await axiosClient.post('/aviones', {
          matricula,
          estadoOperativo,
          aerolineaId,
          modeloAvionId
        });
      }
      await loadData();
    } catch {
      if (editing) {
        setAviones((prev) =>
          prev.map((a) =>
            a.id === editing.id
              ? { ...a, matricula, estadoOperativo, aerolineaId, modeloAvionId, activo }
              : a
          )
        );
      } else {
        const nextId = aviones.length ? Math.max(...aviones.map((a) => a.id)) + 1 : 1;
        setAviones((prev) => [
          ...prev,
          { id: nextId, matricula, estadoOperativo, aerolineaId, modeloAvionId, activo: true }
        ]);
      }
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Flota Aérea / Aeronaves Físicas
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Flota de Aviones Físicos</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Registro de matrículas tail-number, aerolínea propietaria y estado de disponibilidad.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Registrar Aeronave</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F4F5] border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Matrícula (Tail Number)</th>
              <th className="py-2.5 px-4 font-semibold">Aerolínea Propietaria</th>
              <th className="py-2.5 px-4 font-semibold">Modelo Asignado</th>
              <th className="py-2.5 px-4 font-semibold">Estado Operativo</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {aviones.map((item) => {
              const aero = aerolineas.find((a) => a.id === item.aerolineaId);
              const mod = modelos.find((m) => m.id === item.modeloAvionId);
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
                    {mod ? `${mod.fabricante} ${mod.nombreModelo}` : `Modelo #${item.modeloAvionId}`}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                        item.estadoOperativo === 'Operativo'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      {item.estadoOperativo}
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
                {editing ? 'Editar Aeronave Física' : 'Registrar Aeronave Física'}
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
                  Matrícula Oficial (Ej. OB-2150-P)
                </label>
                <input
                  type="text"
                  required
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                  placeholder="OB-2150-P"
                  className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs uppercase outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Aerolínea Propietaria
                </label>
                <select
                  value={aerolineaId}
                  onChange={(e) => setAerolineaId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {aerolineas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} ({a.codigoIata})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Modelo de Avión
                </label>
                <select
                  value={modeloAvionId}
                  onChange={(e) => setModeloAvionId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {modelos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fabricante} {m.nombreModelo} ({m.capacidadTotal} PAX)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Estado Operativo
                </label>
                <select
                  value={estadoOperativo}
                  onChange={(e) => setEstadoOperativo(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  <option value="Operativo">Operativo</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
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
                  Guardar Aeronave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
