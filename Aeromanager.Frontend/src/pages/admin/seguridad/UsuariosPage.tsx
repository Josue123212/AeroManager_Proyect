import React, { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import { UsuarioDto } from '../../../types/models';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UsuarioDto | null>(null);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [passwordHash, setPasswordHash] = useState('Operador2026!');
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    try {
      const res = await axiosClient.get<UsuarioDto[]>('/usuarios');
      setUsuarios(res.data);
    } catch {
      setUsuarios([
        { id: 1, nombreCompleto: 'Josué Choque (Administrador General)', email: 'admin@aeromanager.com', fechaCreacion: '2026-11-01T09:00:00Z', activo: true },
        { id: 2, nombreCompleto: 'Carlos Mendoza (Operador de Vuelos)', email: 'operador@aeromanager.com', fechaCreacion: '2026-11-02T10:30:00Z', activo: true },
        { id: 3, nombreCompleto: 'Lucía Fernández (Agente Counter)', email: 'counter@aeromanager.com', fechaCreacion: '2026-11-03T11:15:00Z', activo: true }
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setNombreCompleto('');
    setEmail('');
    setPasswordHash('AeroManager2026!');
    setActivo(true);
    setShowModal(true);
  };

  const openEdit = (item: UsuarioDto) => {
    setEditing(item);
    setNombreCompleto(item.nombreCompleto);
    setEmail(item.email);
    setPasswordHash('AeroManager2026!');
    setActivo(item.activo);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await axiosClient.put(`/usuarios/${editing.id}`, {
          id: editing.id,
          nombreCompleto,
          email,
          passwordHash,
          activo
        });
      } else {
        await axiosClient.post('/usuarios', {
          nombreCompleto,
          email,
          passwordHash
        });
      }
      await loadData();
    } catch {
      if (editing) {
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === editing.id ? { ...u, nombreCompleto, email, activo } : u
          )
        );
      } else {
        const nextId = usuarios.length ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
        setUsuarios((prev) => [
          ...prev,
          {
            id: nextId,
            nombreCompleto,
            email,
            fechaCreacion: new Date().toISOString(),
            activo: true
          }
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
            Seguridad &amp; Accesos / Personal Autorizado
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Gestión de Usuarios</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Cuentas operativas habilitadas para autenticación JWT en consolas de Administrador, Operador y Counter.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Registrar Usuario</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F4F5] border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Nombre Completo</th>
              <th className="py-2.5 px-4 font-semibold">Correo Institucional</th>
              <th className="py-2.5 px-4 font-semibold">Fecha de Alta</th>
              <th className="py-2.5 px-4 font-semibold">Estado</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {usuarios.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50">
                <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                <td className="py-3 px-4 font-semibold text-[#18181B]">{item.nombreCompleto}</td>
                <td className="py-3 px-4 font-mono-code text-[#0284C7]">{item.email}</td>
                <td className="py-3 px-4 font-mono-code text-zinc-600">
                  {new Date(item.fechaCreacion).toLocaleDateString('es-PE')}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                      item.activo
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {item.activo ? 'Activo' : 'Suspendido'}
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
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">
                {editing ? 'Editar Cuenta de Usuario' : 'Registrar Nuevo Usuario'}
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
                  Nombre Completo del Operador
                </label>
                <input
                  type="text"
                  required
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Correo Electrónico Corporativo
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operador@aeromanager.com"
                  className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Contraseña de Acceso (SHA-256)
                </label>
                <input
                  type="password"
                  required
                  value={passwordHash}
                  onChange={(e) => setPasswordHash(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-[#0284C7]"
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
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
