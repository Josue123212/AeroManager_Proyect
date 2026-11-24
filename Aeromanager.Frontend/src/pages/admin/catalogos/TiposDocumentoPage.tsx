import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../../api/axiosClient';
import { TipoDocumentoDto } from '../../../types/models';
import { notifyError, notifySuccess, notifyUndo } from '../../../utils/notify';

export default function TiposDocumentoPage() {
  const [tipos, setTipos] = useState<TipoDocumentoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TipoDocumentoDto | null>(null);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [longitudMaxima, setLongitudMaxima] = useState<number>(8);
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axiosClient.get<TipoDocumentoDto[]>('/tiposdocumento');
      setTipos(res.data);
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
    setCodigo('');
    setNombre('');
    setLongitudMaxima(8);
    setActivo(true);
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEdit = (item: TipoDocumentoDto) => {
    setEditing(item);
    setCodigo(item.codigo);
    setNombre(item.nombre);
    setLongitudMaxima(item.longitudMaxima);
    setActivo(item.activo);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editing) {
        await axiosClient.put(`/tiposdocumento/${editing.id}`, {
          id: editing.id,
          codigo,
          nombre,
          longitudMaxima,
          activo
        });
        notifySuccess('Documento actualizado', `${codigo} — ${nombre} fue guardado.`);
      } else {
        await axiosClient.post('/tiposdocumento', { codigo, nombre, longitudMaxima });
        notifySuccess('Documento registrado', `${codigo} — ${nombre} fue añadido.`);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      notifyError(
        'No se pudo guardar el tipo de documento',
        extractApiError(err, 'Error al guardar tipo de documento.')
      );
    }
  };

  const handleToggleActivo = async (item: TipoDocumentoDto) => {
    setErrorMsg(null);
    const nextActivo = !item.activo;
    try {
      await axiosClient.put(`/tiposdocumento/${item.id}`, {
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        longitudMaxima: item.longitudMaxima,
        activo: nextActivo
      });
      await loadData();
      if (!nextActivo) {
        notifyUndo('Tipo de documento desactivado', `${item.codigo} pasó a inactivo.`, async () => {
          await axiosClient.put(`/tiposdocumento/${item.id}`, {
            id: item.id,
            codigo: item.codigo,
            nombre: item.nombre,
            longitudMaxima: item.longitudMaxima,
            activo: true
          });
          await loadData();
          notifySuccess('Tipo de documento reactivado', `${item.codigo} está activo.`);
        });
      } else {
        notifySuccess('Tipo de documento reactivado', `${item.codigo} está activo.`);
      }
    } catch (err: any) {
      notifyError(
        'Error al actualizar estado',
        extractApiError(err, 'Error al actualizar estado del tipo de documento.')
      );
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Catálogos Globales / Documentos de Identidad
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Tipos de Documento</h1>
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
          <span>Registrar Tipo de Documento</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F4F5] border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Código Abreviado</th>
              <th className="py-2.5 px-4 font-semibold">Nombre del Documento</th>
              <th className="py-2.5 px-4 font-semibold">Longitud Máxima</th>
              <th className="py-2.5 px-4 font-semibold">Estado</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {tipos.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Cargando información...'
                    : 'No hay tipos de documento registrados.'}
                </td>
              </tr>
            ) : (
              tipos.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono-code font-bold px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                      {item.codigo}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#18181B]">{item.nombre}</td>
                  <td className="py-3 px-4 font-mono-code text-zinc-700">
                    {item.longitudMaxima} caracteres
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
                {editing ? 'Editar Tipo de Documento' : 'Registrar Tipo de Documento'}
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
                  Código Abreviado (Ej. DNI, PAS)
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="DNI"
                  className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs uppercase outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Documento Nacional de Identidad"
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Longitud Máxima de Caracteres (&gt; 0)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={30}
                  value={longitudMaxima}
                  onChange={(e) => setLongitudMaxima(Number(e.target.value))}
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
                  Guardar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
