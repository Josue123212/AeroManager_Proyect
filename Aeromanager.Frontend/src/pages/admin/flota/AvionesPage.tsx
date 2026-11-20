import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import { AerolineaDto, AvionDto, ModeloAvionDto } from '../../../types/models';

export default function AvionesPage() {
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [aerolineas, setAerolineas] = useState<AerolineaDto[]>([]);
  const [modelos, setModelos] = useState<ModeloAvionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AvionDto | null>(null);
  const [matricula, setMatricula] = useState('');
  const [capacidadFisica, setCapacidadFisica] = useState<number>(180);
  const [aerolineaId, setAerolineaId] = useState<number>(0);
  const [modeloAvionId, setModeloAvionId] = useState<number>(0);
  const [estadoOperativo, setEstadoOperativo] = useState('Operativo');
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [avRes, aeRes, moRes] = await Promise.all([
        axiosClient.get<AvionDto[]>('/aviones'),
        axiosClient.get<AerolineaDto[]>('/aerolineas'),
        axiosClient.get<ModeloAvionDto[]>('/modelosavion')
      ]);
      setAviones(avRes.data);
      setAerolineas(aeRes.data);
      setModelos(moRes.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al consultar GET /api/aviones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setMatricula('');
    const firstModel = modelos[0];
    setCapacidadFisica(firstModel?.capacidadTeorica || 180);
    setAerolineaId(aerolineas[0]?.id || 0);
    setModeloAvionId(firstModel?.id || 0);
    setEstadoOperativo('Operativo');
    setActivo(true);
    setShowModal(true);
  };

  const openEdit = (item: AvionDto) => {
    setEditing(item);
    setMatricula(item.matricula);
    setCapacidadFisica(item.capacidadFisica);
    setAerolineaId(item.aerolineaId);
    setModeloAvionId(item.modeloAvionId);
    setEstadoOperativo(item.estadoOperativo);
    setActivo(item.activo);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editing) {
        await axiosClient.put(`/aviones/${editing.id}`, {
          id: editing.id,
          matricula,
          capacidadFisica,
          estadoOperativo,
          aerolineaId,
          modeloAvionId,
          activo
        });
      } else {
        await axiosClient.post('/aviones', {
          matricula,
          capacidadFisica,
          estadoOperativo,
          aerolineaId,
          modeloAvionId
        });
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar aeronave en la BD.');
    }
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
            Registros en vivo desde la tabla Avion (`Matricula`, `CapacidadFisica`, `EstadoOperativo`) en Neon Cloud PostgreSQL.
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
              <th className="py-2.5 px-4 font-semibold">Matrícula (Tail Number)</th>
              <th className="py-2.5 px-4 font-semibold">Aerolínea Propietaria</th>
              <th className="py-2.5 px-4 font-semibold">Modelo Asignado</th>
              <th className="py-2.5 px-4 font-semibold">Capacidad Física</th>
              <th className="py-2.5 px-4 font-semibold">Estado Operativo</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {aviones.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Consultando GET /api/aviones...'
                    : 'No hay aviones registrados en la base de datos.'}
                </td>
              </tr>
            ) : (
              aviones.map((item) => {
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
                    <td className="py-3 px-4 font-mono-code text-zinc-700">
                      {item.capacidadFisica} PAX
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                          item.estadoOperativo.toUpperCase() === 'OPERATIVO'
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Matrícula Oficial
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
                    Capacidad Física (&gt; 0)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={capacidadFisica}
                    onChange={(e) => setCapacidadFisica(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Aerolínea Propietaria
                </label>
                <select
                  required
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
                  required
                  value={modeloAvionId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setModeloAvionId(id);
                    const m = modelos.find((x) => x.id === id);
                    if (m) setCapacidadFisica(m.capacidadTeorica);
                  }}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {modelos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fabricante} {m.nombreModelo} ({m.capacidadTeorica} PAX)
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
                  <option value="EnMantenimiento">EnMantenimiento</option>
                  <option value="FueraDeServicio">FueraDeServicio</option>
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
