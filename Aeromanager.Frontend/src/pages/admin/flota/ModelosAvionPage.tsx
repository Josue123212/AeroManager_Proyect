import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../../api/axiosClient';
import { ModeloAvionDto } from '../../../types/models';
import { notifyError, notifySuccess, notifyUndo } from '../../../utils/notify';

export default function ModelosAvionPage() {
  const [modelos, setModelos] = useState<ModeloAvionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ModeloAvionDto | null>(null);
  const [fabricante, setFabricante] = useState('Airbus');
  const [nombreModelo, setNombreModelo] = useState('');
  const [capacidadTeorica, setCapacidadTeorica] = useState<number>(180);
  const [autonomiaKm, setAutonomiaKm] = useState<number>(6300);
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axiosClient.get<ModeloAvionDto[]>('/modelosavion');
      setModelos(res.data);
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
    setFabricante('Airbus');
    setNombreModelo('');
    setCapacidadTeorica(180);
    setAutonomiaKm(6300);
    setActivo(true);
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEdit = (item: ModeloAvionDto) => {
    setEditing(item);
    setFabricante(item.fabricante);
    setNombreModelo(item.nombreModelo);
    setCapacidadTeorica(item.capacidadTeorica);
    setAutonomiaKm(item.autonomiaKm);
    setActivo(item.activo);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editing) {
        await axiosClient.put(`/modelosavion/${editing.id}`, {
          id: editing.id,
          fabricante,
          nombreModelo,
          capacidadTeorica,
          autonomiaKm,
          activo
        });
        notifySuccess('Modelo actualizado', `${fabricante} ${nombreModelo} fue guardado.`);
      } else {
        await axiosClient.post('/modelosavion', {
          fabricante,
          nombreModelo,
          capacidadTeorica,
          autonomiaKm
        });
        notifySuccess('Modelo registrado', `${fabricante} ${nombreModelo} fue añadido.`);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      notifyError('No se pudo guardar el modelo', extractApiError(err, 'Error al guardar modelo de avión.'));
    }
  };

  const handleToggleActivo = async (item: ModeloAvionDto) => {
    setErrorMsg(null);
    const nextActivo = !item.activo;
    try {
      await axiosClient.put(`/modelosavion/${item.id}`, {
        id: item.id,
        fabricante: item.fabricante,
        nombreModelo: item.nombreModelo,
        capacidadTeorica: item.capacidadTeorica,
        autonomiaKm: item.autonomiaKm,
        activo: nextActivo
      });
      await loadData();
      if (!nextActivo) {
        notifyUndo(
          'Modelo desactivado',
          `${item.fabricante} ${item.nombreModelo} pasó a inactivo.`,
          async () => {
            await axiosClient.put(`/modelosavion/${item.id}`, {
              id: item.id,
              fabricante: item.fabricante,
              nombreModelo: item.nombreModelo,
              capacidadTeorica: item.capacidadTeorica,
              autonomiaKm: item.autonomiaKm,
              activo: true
            });
            await loadData();
            notifySuccess('Modelo reactivado', `${item.fabricante} ${item.nombreModelo} está activo.`);
          }
        );
      } else {
        notifySuccess('Modelo reactivado', `${item.fabricante} ${item.nombreModelo} está activo.`);
      }
    } catch (err: any) {
      notifyError('Error al actualizar estado', extractApiError(err, 'Error al actualizar estado del modelo de avión.'));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Flota Aérea / Especificaciones Técnicas
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Modelos de Avión</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Registros en vivo desde la tabla ModeloAvion (`CapacidadTeorica` y `AutonomiaKm`).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Registrar Modelo de Aeronave</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F4F5] border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Fabricante</th>
              <th className="py-2.5 px-4 font-semibold">Modelo</th>
              <th className="py-2.5 px-4 font-semibold">Capacidad Teórica</th>
              <th className="py-2.5 px-4 font-semibold">Autonomía (KM)</th>
              <th className="py-2.5 px-4 font-semibold">Estado</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {modelos.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Cargando información...'
                    : 'No hay modelos de avión registrados.'}
                </td>
              </tr>
            ) : (
              modelos.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                  <td className="py-3 px-4 font-semibold text-zinc-700">{item.fabricante}</td>
                  <td className="py-3 px-4 font-mono-code font-bold text-[#0284C7]">
                    {item.nombreModelo}
                  </td>
                  <td className="py-3 px-4 font-mono-code">{item.capacidadTeorica} PAX</td>
                  <td className="py-3 px-4 font-mono-code">
                    {item.autonomiaKm.toLocaleString()} km
                  </td>
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
                {editing ? 'Editar Modelo de Aeronave' : 'Registrar Modelo de Aeronave'}
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
                  Fabricante
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={fabricante}
                  onChange={(e) => setFabricante(e.target.value)}
                  placeholder="Airbus / Boeing / Embraer"
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Nombre del Modelo
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={nombreModelo}
                  onChange={(e) => setNombreModelo(e.target.value)}
                  placeholder="A320neo"
                  className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Capacidad Teórica (&gt; 0)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={capacidadTeorica}
                    onChange={(e) => setCapacidadTeorica(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Autonomía en KM (&gt; 0)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={autonomiaKm}
                    onChange={(e) => setAutonomiaKm(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
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
                  Guardar Modelo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
