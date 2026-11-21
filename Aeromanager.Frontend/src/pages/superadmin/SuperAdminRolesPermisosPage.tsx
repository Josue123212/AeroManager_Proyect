import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../api/axiosClient';
import { RolDto, UsuarioDto, UsuarioRolDto } from '../../types/models';

export default function SuperAdminRolesPermisosPage() {
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [asignaciones, setAsignaciones] = useState<UsuarioRolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number>(0);
  const [rolId, setRolId] = useState<number>(0);

  const [editingRole, setEditingRole] = useState<RolDto | null>(null);
  const [roleNombre, setRoleNombre] = useState('');
  const [roleDescripcion, setRoleDescripcion] = useState('');
  const [roleActivo, setRoleActivo] = useState(true);

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
      setErrorMsg(extractApiError(err, 'No se pudo cargar la matriz RBAC.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const assignableRoles = roles.filter((r) => r.nombre.trim().toLowerCase() !== 'superadmin');
  const superAdminRoleId = roles.find((r) => r.nombre.trim().toLowerCase() === 'superadmin')?.id;
  const superAdminUserIds = new Set(
    asignaciones
      .filter((a) => a.activo && a.rolId === superAdminRoleId)
      .map((a) => a.usuarioId)
  );
  const assignableUsers = usuarios.filter((u) => !superAdminUserIds.has(u.id));

  const openAssignModal = () => {
    setUsuarioId(assignableUsers[0]?.id || 0);
    setRolId(assignableRoles[0]?.id || 0);
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
      setErrorMsg(extractApiError(err, 'Error al asignar rol al usuario.'));
    }
  };

  const handleToggleAssignment = async (item: UsuarioRolDto, roleName: string) => {
    if (roleName.trim().toLowerCase() === 'superadmin') {
      setErrorMsg('La asignación del rol SuperAdmin es inmutable.');
      return;
    }
    setErrorMsg(null);
    try {
      await axiosClient.put(`/usuarioroles/${item.id}`, {
        id: item.id,
        usuarioId: item.usuarioId,
        rolId: item.rolId,
        activo: !item.activo
      });
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'No se pudo actualizar la asignación de rol.'));
    }
  };

  const openEditRole = (rol: RolDto) => {
    setEditingRole(rol);
    setRoleNombre(rol.nombre);
    setRoleDescripcion(rol.descripcion || '');
    setRoleActivo(rol.activo);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setErrorMsg(null);
    try {
      await axiosClient.put(`/roles/${editingRole.id}`, {
        id: editingRole.id,
        nombre: roleNombre,
        descripcion: roleDescripcion,
        activo: editingRole.nombre.trim().toLowerCase() === 'superadmin' ? true : roleActivo
      });
      setEditingRole(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'Error al actualizar el rol maestro.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Gobierno &amp; Seguridad / Matriz RBAC Maestra
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Roles y Privilegios (SuperAdmin)</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Único panel autorizado para otorgar o revocar el rol Administrador y gobernar roles maestros.
          </p>
        </div>
        <button
          type="button"
          onClick={openAssignModal}
          className="h-9 px-4 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Asignar Rol (Incl. Administrador)</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => {
          const isSuperAdmin = r.nombre.trim().toLowerCase() === 'superadmin';
          return (
            <div
              key={r.id}
              className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                    ROL #{r.id}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {r.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#18181B] mt-2">{r.nombre}</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{r.descripcion || '—'}</p>
              </div>
              <button
                type="button"
                disabled={isSuperAdmin}
                onClick={() => openEditRole(r)}
                className="h-8 px-3 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSuperAdmin ? 'Rol Maestro Protegido' : 'Editar Descripción'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200">
          <h2 className="text-sm font-bold text-[#18181B]">Asignaciones de Roles (UsuarioRol)</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Usuario Asignado</th>
              <th className="py-2.5 px-4 font-semibold">Rol Otorgado</th>
              <th className="py-2.5 px-4 font-semibold">Fecha de Asignación</th>
              <th className="py-2.5 px-4 font-semibold">Estado</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {asignaciones.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  {loading ? 'Cargando asignaciones...' : 'No hay asignaciones registradas.'}
                </td>
              </tr>
            ) : (
              asignaciones.map((item) => {
                const u = usuarios.find((x) => x.id === item.usuarioId);
                const r = roles.find((x) => x.id === item.rolId);
                const roleName = r ? r.nombre : `Rol #${item.rolId}`;
                const isSuperAdminRole = roleName.trim().toLowerCase() === 'superadmin';
                return (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#18181B]">
                      {u ? `${u.nombreCompleto} (${u.email})` : `Usuario #${item.usuarioId}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code font-bold px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                        {roleName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-600">
                      {new Date(item.fechaAsignacion).toLocaleString('es-PE')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                          item.activo
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-zinc-100 border-zinc-300 text-zinc-600'
                        }`}
                      >
                        {item.activo ? 'Vigente' : 'Revocado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        disabled={isSuperAdminRole}
                        onClick={() => handleToggleAssignment(item, roleName)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          item.activo
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isSuperAdminRole ? 'Protegido' : item.activo ? 'Revocar' : 'Reactivar'}
                      </button>
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
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-indigo-600"
                >
                  {assignableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombreCompleto} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Seleccionar Rol
                </label>
                <select
                  required
                  value={rolId}
                  onChange={(e) => setRolId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-indigo-600"
                >
                  {assignableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Como SuperAdmin puedes asignar Administrador, Operador o Counter.
                </p>
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
                  className="h-9 px-4 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">Editar Rol #{editingRole.id}</h3>
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveRole} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Nombre del Rol
                </label>
                <input
                  type="text"
                  required
                  value={roleNombre}
                  onChange={(e) => setRoleNombre(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={roleDescripcion}
                  onChange={(e) => setRoleDescripcion(e.target.value)}
                  className="w-full p-3 rounded border border-zinc-300 text-xs outline-none focus:border-indigo-600"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-700">
                <input
                  type="checkbox"
                  checked={roleActivo}
                  onChange={(e) => setRoleActivo(e.target.checked)}
                />
                <span>Rol activo en el sistema</span>
              </label>
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="h-9 px-4 rounded bg-[#F4F4F5] text-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Guardar Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
