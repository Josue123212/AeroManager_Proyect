import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import { RolDto, UsuarioDto, UsuarioRolDto } from '../../../types/models';

export default function RolesPermisosPage() {
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [asignaciones, setAsignaciones] = useState<UsuarioRolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number>(0);
  const [rolId, setRolId] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [rRes, uRes, urRes] = await Promise.all([
        axiosClient.get<RolDto[]>('/roles'),
        axiosClient.get<UsuarioDto[]>('/usuarios'),
        axiosClient.get<UsuarioRolDto[]>('/usuarioroles')
      ]);
      setRoles(rRes.data);
      setUsuarios(uRes.data);
      setAsignaciones(urRes.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al consultar GET /api/usuarioroles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = () => {
    setUsuarioId(usuarios[0]?.id || 0);
    setRolId(roles[0]?.id || 0);
    setShowAssignModal(true);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await axiosClient.post('/usuarioroles', { usuarioId, rolId });
      setShowAssignModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al asignar rol a usuario en la BD.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Seguridad &amp; Accesos / Matriz RBAC
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Roles y Permisos (UsuarioRol)</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Registros en vivo desde las tablas Rol y UsuarioRol en Neon Cloud PostgreSQL (`GET /api/roles`, `GET /api/usuarioroles`).
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Asignar Rol a Usuario</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Tarjetas de Roles desde la tabla Rol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((r) => (
          <div
            key={r.id}
            className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-xs font-bold px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                  ROL #{r.id}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {r.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#18181B] mt-2">{r.nombre}</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{r.descripcion || '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de Asignaciones UsuarioRol */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200">
          <h2 className="text-sm font-bold text-[#18181B]">
            Asignaciones Activas de Roles (Tabla UsuarioRol)
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Usuario Asignado</th>
              <th className="py-2.5 px-4 font-semibold">Rol Otorgado</th>
              <th className="py-2.5 px-4 font-semibold">Fecha de Asignación</th>
              <th className="py-2.5 px-4 font-semibold text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {asignaciones.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Consultando GET /api/usuarioroles...'
                    : 'No hay asignaciones UsuarioRol registradas en la base de datos.'}
                </td>
              </tr>
            ) : (
              asignaciones.map((item) => {
                const u = usuarios.find((x) => x.id === item.usuarioId);
                const r = roles.find((x) => x.id === item.rolId);
                return (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#18181B]">
                      {u ? `${u.nombreCompleto} (${u.email})` : `Usuario #${item.usuarioId}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code font-bold px-2.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                        {r ? r.nombre : `Rol #${item.rolId}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-600">
                      {new Date(item.fechaAsignacion).toLocaleString('es-PE')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold bg-emerald-50 border-emerald-200 text-emerald-700">
                        {item.activo ? 'Vigente' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">Asignar Rol a Usuario</h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <form onSubmit={handleAssign} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Seleccionar Usuario
                </label>
                <select
                  required
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombreCompleto} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Seleccionar Rol Operativo
                </label>
                <select
                  required
                  value={rolId}
                  onChange={(e) => setRolId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="h-9 px-4 rounded bg-[#F4F4F5] text-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold cursor-pointer"
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
