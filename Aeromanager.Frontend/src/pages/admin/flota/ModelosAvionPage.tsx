import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import { ModeloAvionDto } from '../../../types/models';

export default function ModelosAvionPage() {
  const [modelos, setModelos] = useState<ModeloAvionDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ModeloAvionDto | null>(null);
  const [fabricante, setFabricante] = useState('Airbus');
  const [nombreModelo, setNombreModelo] = useState('');
  const [capacidadTotal, setCapacidadTotal] = useState<number>(180);
  const [alcanceKm, setAlcanceKm] = useState<number>(6300);
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    try {
      const res = await axiosClient.get<ModeloAvionDto[]>('/modelosavion');
      setModelos(res.data);
    } catch {
      setModelos([
        { id: 1, fabricante: 'Airbus', nombreModelo: 'A320neo', capacidadTotal: 180, alcanceKm: 6300, activo: true },
        { id: 2, fabricante: 'Boeing', nombreModelo: '737 MAX 8', capacidadTotal: 189, alcanceKm: 6570, activo: true },
        { id: 3, fabricante: 'Boeing', nombreModelo: '787-9 Dreamliner', capacidadTotal: 290, alcanceKm: 14140, activo: true }
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFabricante('Airbus');
    setNombreModelo('');
    setCapacidadTotal(180);
    setAlcanceKm(6300);
    setActivo(true);
    setShowModal(true);
  };

  const openEdit = (item: ModeloAvionDto) => {
    setEditing(item);
    setFabricante(item.fabricante);
    setNombreModelo(item.nombreModelo);
    setCapacidadTotal(item.capacidadTotal);
    setAlcanceKm(item.alcanceKm);
    setActivo(item.activo);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await axiosClient.put(`/modelosavion/${editing.id}`, {
          id: editing.id,
          fabricante,
          nombreModelo,
          capacidadTotal,
          alcanceKm,
          activo
        });
      } else {
        await axiosClient.post('/modelosavion', {
          fabricante,
          nombreModelo,
          capacidadTotal,
          alcanceKm
        });
      }
      await loadData();
    } catch {
      if (editing) {
        setModelos((prev) =>
          prev.map((m) =>
            m.id === editing.id
              ? { ...m, fabricante, nombreModelo, capacidadTotal, alcanceKm, activo }
              : m
          )
        );
      } else {
        const nextId = modelos.length ? Math.max(...modelos.map((m) => m.id)) + 1 : 1;
        setModelos((prev) => [
          ...prev,
          { id: nextId, fabricante, nombreModelo, capacidadTotal, alcanceKm, activo: true }
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
            Flota Aérea / Especificaciones Técnicas
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Modelos de Avión</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ficha técnica de capacidad teórica de asientos y autonomía máxima en kilómetros.
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
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {modelos.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50">
                <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                <td className="py-3 px-4 font-semibold text-zinc-700">{item.fabricante}</td>
                <td className="py-3 px-4 font-mono-code font-bold text-[#0284C7]">
                  {item.nombreModelo}
                </td>
                <td className="py-3 px-4 font-mono-code">{item.capacidadTotal} PAX</td>
                <td className="py-3 px-4 font-mono-code">
                  {item.alcanceKm.toLocaleString()} km
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
                    value={capacidadTotal}
                    onChange={(e) => setCapacidadTotal(Number(e.target.value))}
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
                    value={alcanceKm}
                    onChange={(e) => setAlcanceKm(Number(e.target.value))}
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
