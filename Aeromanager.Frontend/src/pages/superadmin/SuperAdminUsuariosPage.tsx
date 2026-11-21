import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../api/axiosClient';
import { RolDto, UsuarioDto, UsuarioRolDto } from '../../types/models';

export default function SuperAdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [asignaciones, setAsignaciones] = useState<UsuarioRolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UsuarioDto | null>(null);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [estadoAcceso, setEstadoAcceso] = useState('Activo');

  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem('aeromanager_user');
      return raw ? Number(JSON.parse(raw).usuarioId || 0) : 0;
    } catch {
      return 0;
    }
  })();

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
      setErrorMsg(extractApiError(err, 'No se pudo cargar la lista de cuentas.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUserRoles = (userId: number): string[] => {
    const activeLinks = asignaciones.filter((a) => a.usuarioId === userId && a.activo);
    return activeLinks
      .map((a) => roles.find((r) => r.id === a.rolId)?.nombre)
      .filter((n): n is string => Boolean(n));
  };

  const openCreate = () => {
    setEditing(null);
    setNombreCompleto('');
    setEmail('');
    setPassword('');
    setEstadoAcceso('Activo');
    setShowModal(true);
  };

  const openEdit = (item: UsuarioDto) => {
    setEditing(item);
    setNombreCompleto(item.nombreCompleto);
    setEmail(item.email);
    setPassword('');
    setEstadoAcceso(item.estadoAcceso || (item.activo ? 'Activo' : 'Suspendido'));
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const derivedActivo = estadoAcceso === 'Activo';
    if (editing && editing.id === currentUserId && !derivedActivo) {
      setErrorMsg('No puedes suspender o bloquear tu propia cuenta SuperAdmin en sesión.');
      return;
    }

    try {
      if (editing) {
        await axiosClient.put(`/usuarios/${editing.id}`, {
          id: editing.id,
          nombreCompleto,
          email,
          estadoAcceso,
          activo: derivedActivo
        });
      } else {
        await axiosClient.post('/usuarios', {
          nombreCompleto,
          email,
          password,
          estadoAcceso
        });
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'Error al guardar cuenta de usuario.'));
    }
  };

  const toggleStatus = async (item: UsuarioDto) => {
    if (item.id === currentUserId) {
      setErrorMsg('No puedes suspender o desactivar tu propia cuenta SuperAdmin en sesión.');
      return;
    }
    setErrorMsg(null);
    try {
      const nextActivo = !item.activo;
      await axiosClient.put(`/usuarios/${item.id}`, {
        id: item.id,
        nombreCompleto: item.nombreCompleto,
        email: item.email,
        estadoAcceso: nextActivo ? 'Activo' : 'Suspendido',
        activo: nextActivo
      });
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'No se pudo actualizar el estado de la cuenta.'));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Gobierno &amp; Seguridad / Cuentas del Sistema
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Cuentas y Administradores</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Alta, edición y suspensión de cuentas administrativas y operativas.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Registrar Cuenta</span>
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
              <th className="py-2.5 px-4 font-semibold">Nombre / Correo</th>
              <th className="py-2.5 px-4 font-semibold">Roles Activos</th>
              <th className="py-2.5 px-4 font-semibold">Estado Acceso</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  {loading ? 'Cargando cuentas...' : 'No hay cuentas registradas.'}
                </td>
              </tr>
            ) : (
              usuarios.map((item) => {
                const userRoles = getUserRoles(item.id);
                const isSelf = item.id === currentUserId;
                return (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#18181B]">
                        {item.nombreCompleto} {isSelf && <span className="text-[10px] text-indigo-600">(Tú)</span>}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono-code">{item.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {userRoles.length === 0 ? (
                          <span className="text-[11px] text-zinc-400">Sin rol asignado</span>
                        ) : (
                          userRoles.map((r) => (
                            <span
                              key={r}
                              className={`font-mono-code text-[11px] font-bold px-2 py-0.5 rounded border ${
                                r.toLowerCase() === 'superadmin'
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                  : r.toLowerCase() === 'administrador'
                                    ? 'bg-sky-50 border-sky-200 text-[#0284C7]'
                                    : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                              }`}
                            >
                              {r}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                          item.activo
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                      >
                        {item.activo ? item.estadoAcceso || 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => toggleStatus(item)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          item.activo
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.activo ? 'Suspender' : 'Reactivar'}
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
                {editing ? 'Editar Cuenta' : 'Registrar Nueva Cuenta'}
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
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Correo Institucional
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-indigo-600"
                />
              </div>
              {!editing && (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Contraseña Inicial
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-indigo-600"
                  />
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Estado de Acceso
                </label>
                <select
                  value={estadoAcceso}
                  disabled={editing?.id === currentUserId}
                  onChange={(e) => {
                    setEstadoAcceso(e.target.value);
                  }}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-indigo-600 disabled:bg-zinc-100"
                >
                  <option value="Activo">Activo (permite iniciar sesión)</option>
                  <option value="Suspendido">Suspendido (bloquea acceso)</option>
                  <option value="Bloqueado">Bloqueado (bloquea acceso)</option>
                </select>
                {editing?.id === currentUserId && (
                  <p className="text-[11px] text-zinc-500 mt-1">
                    No puedes suspender o bloquear tu propia cuenta en sesión.
                  </p>
                )}
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
                  className="h-9 px-4 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
