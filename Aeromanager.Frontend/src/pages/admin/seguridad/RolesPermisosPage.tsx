import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../../api/axiosClient';
import { RolDto, UsuarioDto, UsuarioRolDto } from '../../../types/models';

export default function RolesPermisosPage() {
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [asignaciones, setAsignaciones] = useState<UsuarioRolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [changingUserMode, setChangingUserMode] = useState(false);
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
      setErrorMsg(extractApiError(err, 'No se pudo cargar la información del servidor.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Ocultar el rol SuperAdmin en la consola del Administrador
  const visibleRoles = roles.filter(
    (r) => r.nombre.trim().toLowerCase() !== 'superadmin'
  );

  // Solo roles operativos asignables por un Administrador (Operador y Counter)
  const assignableRoles = roles.filter(
    (r) => !r.nombre.toLowerCase().includes('admin')
  );

  // Excluir cuentas SuperAdmin y Administrador del selector de asignación
  const adminOrSuperAdminRoleIds = new Set(
    roles
      .filter((r) => r.nombre.toLowerCase().includes('admin'))
      .map((r) => r.id)
  );
  const privilegedUserIds = new Set(
    asignaciones
      .filter((a) => a.activo && adminOrSuperAdminRoleIds.has(a.rolId))
      .map((a) => a.usuarioId)
  );
  const assignableUsers = usuarios.filter((u) => !privilegedUserIds.has(u.id));
  const activeAssignedUserIds = new Set(
    asignaciones.filter((a) => a.activo).map((a) => a.usuarioId)
  );
  const unassignedUsers = assignableUsers.filter((u) => !activeAssignedUserIds.has(u.id));

  // Ocultar las filas de SuperAdmin y las asignaciones revocadas (solo activas)
  const superAdminRoleIds = new Set(
    roles
      .filter((r) => r.nombre.trim().toLowerCase() === 'superadmin')
      .map((r) => r.id)
  );
  const superAdminUserIds = new Set(
    asignaciones
      .filter((a) => superAdminRoleIds.has(a.rolId))
      .map((a) => a.usuarioId)
  );
  const visibleAsignaciones = asignaciones.filter(
    (a) => a.activo && !superAdminRoleIds.has(a.rolId) && !superAdminUserIds.has(a.usuarioId)
  );

  const openModal = (presetUsuarioId?: number) => {
    const isChange = Boolean(presetUsuarioId);
    setChangingUserMode(isChange);
    setUsuarioId(presetUsuarioId || unassignedUsers[0]?.id || 0);
    setRolId(assignableRoles[0]?.id || 0);
    setShowAssignModal(true);
  };

  const revokeOtherActiveRoles = async (targetUsuarioId: number, keepId?: number) => {
    const activeOthers = asignaciones.filter(
      (a) => a.usuarioId === targetUsuarioId && a.activo && a.id !== keepId
    );
    await Promise.all(
      activeOthers.map((old) =>
        axiosClient.put(`/usuarioroles/${old.id}`, {
          id: old.id,
          usuarioId: old.usuarioId,
          rolId: old.rolId,
          activo: false
        })
      )
    );
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!usuarioId) {
      setErrorMsg('Seleccione un usuario operativo válido.');
      return;
    }
    if (!rolId) {
      setErrorMsg('Seleccione un rol operativo válido.');
      return;
    }
    try {
      await revokeOtherActiveRoles(usuarioId);
      const existingInactive = asignaciones.find(
        (a) => a.usuarioId === usuarioId && a.rolId === rolId && !a.activo
      );
      if (existingInactive) {
        await axiosClient.put(`/usuarioroles/${existingInactive.id}`, {
          id: existingInactive.id,
          usuarioId,
          rolId,
          activo: true
        });
      } else {
        await axiosClient.post('/usuarioroles', { usuarioId, rolId });
      }
      setShowAssignModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'Error al asignar rol a usuario.'));
    }
  };

  const handleToggleOperationalRole = async (item: UsuarioRolDto, roleName: string) => {
    if (roleName.toLowerCase().includes('admin')) {
      setErrorMsg('Solo un SuperAdmin puede modificar o revocar el rol Administrador.');
      return;
    }
    setErrorMsg(null);
    try {
      if (!item.activo) {
        await revokeOtherActiveRoles(item.usuarioId, item.id);
      }
      await axiosClient.put(`/usuarioroles/${item.id}`, {
        id: item.id,
        usuarioId: item.usuarioId,
        rolId: item.rolId,
        activo: !item.activo
      });
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'No se pudo actualizar la asignación del rol operativo.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Seguridad &amp; Accesos / Matriz RBAC Operativa
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Roles y Permisos (UsuarioRol)</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Asignación de roles operativos (Operador y Counter). El rol Administrador es gestionado por SuperAdmin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Asignar Rol Operativo</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Tarjetas de Roles visibles para Administrador */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleRoles.map((r) => (
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

      {/* Tabla de Asignaciones UsuarioRol (sin SuperAdmin) */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200">
          <h2 className="text-sm font-bold text-[#18181B]">Asignaciones Activas de Roles</h2>
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
            {visibleAsignaciones.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Cargando información...'
                    : 'No hay asignaciones de roles registradas.'}
                </td>
              </tr>
            ) : (
              visibleAsignaciones.map((item) => {
                const u = usuarios.find((x) => x.id === item.usuarioId);
                const r = roles.find((x) => x.id === item.rolId);
                const roleName = r ? r.nombre : `Rol #${item.rolId}`;
                const isAdminRole = roleName.toLowerCase().includes('admin');
                return (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#18181B]">
                      {u ? `${u.nombreCompleto} (${u.email})` : `Usuario #${item.usuarioId}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code font-bold px-2.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
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
                    <td className="py-3 px-4 text-right space-x-2">
                      {isAdminRole ? (
                        <span className="inline-flex px-2.5 py-1 rounded bg-zinc-100 border border-zinc-200 text-zinc-500 text-[11px] font-semibold">
                          Gestionado por SuperAdmin
                        </span>
                      ) : (
                        <>
                          {item.activo && (
                            <button
                              type="button"
                              onClick={() => openModal(item.usuarioId)}
                              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 cursor-pointer"
                            >
                              Cambiar Rol
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleOperationalRole(item, roleName)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                              item.activo
                                ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {item.activo ? 'Revocar' : 'Reactivar'}
                          </button>
                        </>
                      )}
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
              <h3 className="text-sm font-bold text-[#18181B]">
                {changingUserMode ? 'Cambiar Rol Operativo' : 'Asignar Rol Operativo a Usuario'}
              </h3>
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
                  {changingUserMode ? 'Usuario Operativo' : 'Seleccionar Usuario (sin rol activo)'}
                </label>
                {changingUserMode ? (
                  <div className="w-full h-9 px-3 rounded border border-zinc-200 bg-zinc-50 text-xs flex items-center font-semibold text-zinc-700">
                    {(() => {
                      const u = usuarios.find((x) => x.id === usuarioId);
                      return u ? `${u.nombreCompleto} (${u.email})` : `Usuario #${usuarioId}`;
                    })()}
                  </div>
                ) : unassignedUsers.length === 0 ? (
                  <div className="p-2.5 rounded border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                    Todos los usuarios operativos ya tienen un rol asignado. Usa <strong>Cambiar Rol</strong> en la tabla si deseas modificar alguno.
                  </div>
                ) : (
                  <select
                    required
                    value={usuarioId}
                    onChange={(e) => setUsuarioId(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                  >
                    {unassignedUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombreCompleto} ({u.email})
                      </option>
                    ))}
                  </select>
                )}
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
                  {assignableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Solo se pueden asignar roles operativos (Operador o Counter) a personal operativo.
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
                  disabled={!changingUserMode && unassignedUsers.length === 0}
                  className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingUserMode ? 'Guardar Cambio de Rol' : 'Confirmar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
