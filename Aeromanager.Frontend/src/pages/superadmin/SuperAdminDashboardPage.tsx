import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient, { extractApiError } from '../../api/axiosClient';
import { RolDto, UsuarioDto, UsuarioRolDto } from '../../types/models';

export default function SuperAdminDashboardPage() {
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [asignaciones, setAsignaciones] = useState<UsuarioRolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [uRes, rRes, urRes] = await Promise.all([
        axiosClient.get<UsuarioDto[]>('/usuarios'),
        axiosClient.get<RolDto[]>('/roles'),
        axiosClient.get<UsuarioRolDto[]>('/usuarioroles')
      ]);
      setUsuarios(uRes.data);
      setRoles(rRes.data);
      setAsignaciones(urRes.data);
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'No se pudo cargar el panel de gobierno.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const adminRole = roles.find((r) => r.nombre.toLowerCase() === 'administrador');
  const activeAdminsCount = adminRole
    ? asignaciones.filter((a) => a.rolId === adminRole.id && a.activo).length
    : 0;
  const activeUsersCount = usuarios.filter((u) => u.activo).length;
  const suspendedUsersCount = usuarios.filter((u) => !u.activo).length;
  const recentAssignments = [...asignaciones]
    .sort((a, b) => new Date(b.fechaAsignacion).getTime() - new Date(a.fechaAsignacion).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Gobierno &amp; Seguridad / Supervisión Global
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Panel de Gobierno SuperAdmin</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Control centralizado de cuentas administrativas, roles maestros y trazabilidad RBAC.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="h-9 px-4 rounded bg-white border border-zinc-300 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">refresh</span>
          <span>Actualizar</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-zinc-500">Cuentas Activas</span>
          <p className="text-2xl font-bold text-[#18181B] mt-1">{loading ? '—' : activeUsersCount}</p>
          <span className="text-[11px] text-emerald-700 font-medium">
            {usuarios.length} usuarios totales registrados
          </span>
        </div>

        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-zinc-500">
            Cuentas Suspendidas / Inactivas
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {loading ? '—' : suspendedUsersCount}
          </p>
          <span className="text-[11px] text-zinc-500">Accesos bloqueados o revocados</span>
        </div>

        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-zinc-500">
            Administradores Vigentes
          </span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {loading ? '—' : activeAdminsCount}
          </p>
          <span className="text-[11px] text-zinc-500">Gestionables solo por SuperAdmin</span>
        </div>

        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-zinc-500">Roles Maestros</span>
          <p className="text-2xl font-bold text-[#18181B] mt-1">{loading ? '—' : roles.length}</p>
          <span className="text-[11px] text-zinc-500">
            {asignaciones.filter((a) => a.activo).length} asignaciones activas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/superadmin/usuarios"
          className="p-4 bg-white border border-zinc-200 hover:border-indigo-400 rounded-xl shadow-2xs flex items-center justify-between transition-colors"
        >
          <div>
            <h3 className="text-sm font-bold text-[#18181B]">Gestionar Cuentas y Administradores</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Crear cuentas, editar datos y suspender o reactivar accesos.
            </p>
          </div>
          <span className="material-symbols-outlined text-indigo-600">arrow_forward</span>
        </Link>

        <Link
          to="/superadmin/roles-permisos"
          className="p-4 bg-white border border-zinc-200 hover:border-indigo-400 rounded-xl shadow-2xs flex items-center justify-between transition-colors"
        >
          <div>
            <h3 className="text-sm font-bold text-[#18181B]">Gobierno de Roles y Privilegios</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Asignar o revocar el rol Administrador y administrar roles maestros.
            </p>
          </div>
          <span className="material-symbols-outlined text-indigo-600">arrow_forward</span>
        </Link>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200">
          <h2 className="text-sm font-bold text-[#18181B]">
            Auditoría Reciente de Asignaciones (UsuarioRol)
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Usuario</th>
              <th className="py-2.5 px-4 font-semibold">Rol</th>
              <th className="py-2.5 px-4 font-semibold">Fecha</th>
              <th className="py-2.5 px-4 font-semibold text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {recentAssignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  {loading ? 'Cargando auditoría...' : 'Sin movimientos registrados.'}
                </td>
              </tr>
            ) : (
              recentAssignments.map((item) => {
                const u = usuarios.find((x) => x.id === item.usuarioId);
                const r = roles.find((x) => x.id === item.rolId);
                return (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#18181B]">
                      {u ? `${u.nombreCompleto} (${u.email})` : `Usuario #${item.usuarioId}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                        {r ? r.nombre : `Rol #${item.rolId}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-600">
                      {new Date(item.fechaAsignacion).toLocaleString('es-PE')}
                    </td>
                    <td className="py-3 px-4 text-right">
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
