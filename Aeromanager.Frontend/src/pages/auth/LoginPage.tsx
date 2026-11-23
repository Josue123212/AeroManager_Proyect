import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axiosClient, { extractApiError } from '../../api/axiosClient';
import { getHomePathForRoles, getSessionHomePath } from '../../components/auth/ProtectedRoute';
import { LoginResponseDto, RolActivoType } from '../../types/models';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeSessionPath = getSessionHomePath();
  if (activeSessionPath !== '/login') {
    return <Navigate to={activeSessionPath} replace />;
  }

  const resolvePrimaryRole = (roles: string[]): RolActivoType => {
    const normalized = roles.map((r) => r.trim().toLowerCase());
    if (normalized.some((r) => r === 'superadmin')) return 'SuperAdmin';
    if (normalized.some((r) => r.includes('admin'))) return 'Administrador';
    if (normalized.some((r) => r.includes('operador'))) return 'Operador';
    return 'Counter';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await axiosClient.post<LoginResponseDto>('/auth/login', {
        email,
        password
      });
      const data = response.data;
      const realRoles = Array.isArray(data.roles) && data.roles.length > 0 ? data.roles : [];
      if (realRoles.length === 0) {
        setErrorMsg('El usuario no tiene un rol operativo asignado.');
        return;
      }

      const primaryRole = resolvePrimaryRole(realRoles);
      localStorage.setItem('aeromanager_token', data.token);
      localStorage.setItem(
        'aeromanager_user',
        JSON.stringify({
          usuarioId: data.id ?? data.usuarioId,
          nombreCompleto: data.nombreCompleto,
          email: data.email,
          rolActivo: primaryRole,
          roles: realRoles
        })
      );

      navigate(getHomePathForRoles(realRoles), { replace: true });
    } catch (err: any) {
      setErrorMsg(
        extractApiError(
          err,
          'Credenciales inválidas o usuario inactivo. Verifique su correo y contraseña.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#18181B] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Panel Izquierdo: Identidad Corporativa AeroManager */}
        <div className="w-full md:w-5/12 bg-[#F4F4F5] p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="AeroManager"
                className="w-10 h-10 rounded-lg shadow-sm object-cover"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#18181B] tracking-tight leading-none">
                  AeroManager
                </span>
                <span className="text-[11px] font-semibold text-[#0284C7] uppercase tracking-wider mt-1">
                  Terminal OPS Suite
                </span>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-sm font-semibold text-[#18181B]">
                Plataforma Centralizada de Gestión Aeroportuaria
              </p>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Sistema integral para administración de infraestructura aeroportuaria, flota aérea,
                programación de vuelos, asignación de puertas de embarque y emisión de reservas en
                mostrador.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-2xs space-y-2 text-xs text-zinc-700">
              <div className="font-bold text-[11px] uppercase tracking-wider text-zinc-500">
                Módulos por Perfil Operativo
              </div>
              <div className="flex items-center justify-between">
                <span>Administrador</span>
                <span className="font-mono-code font-semibold text-[#0284C7]">
                  Catálogos, Flota &amp; Reportes
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Operador de Vuelos</span>
                <span className="font-mono-code font-semibold text-[#0284C7]">
                  FIDS, Rutas &amp; Gates
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Agente de Counter</span>
                <span className="font-mono-code font-semibold text-[#0284C7]">
                  Cabina, Check-In &amp; Tickets
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="material-symbols-outlined text-base text-[#0284C7]">
                verified_user
              </span>
              <span className="text-xs font-medium">Acceso Seguro con Control de Roles</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="material-symbols-outlined text-base text-emerald-600">
                event_seat
              </span>
              <span className="text-xs font-medium">Control Transaccional de Asientos</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Formulario de Autenticación */}
        <div className="w-full md:w-7/12 bg-white p-6 md:p-8 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto flex flex-col">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-[#18181B] tracking-tight">Acceso Operativo</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Ingrese sus credenciales autorizadas para acceder a su consola asignada.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="email"
                  className="text-[11px] uppercase text-zinc-700 font-semibold tracking-wider"
                >
                  Correo Corporativo
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-zinc-400 text-lg">
                    alternate_email
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@aeromanager.com"
                    className="w-full h-9 pl-9 pr-3 rounded border border-zinc-300 bg-white text-[#18181B] text-sm outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="password"
                  className="text-[11px] uppercase text-zinc-700 font-semibold tracking-wider"
                >
                  Contraseña
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-zinc-400 text-lg">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-9 pl-9 pr-10 rounded border border-zinc-300 bg-white text-[#18181B] text-sm outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-500 hover:text-zinc-800 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-9 mt-1 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold rounded shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
