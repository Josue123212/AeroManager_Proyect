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
    /* ── Contenedor raíz: posición relativa para que el video quede detrás ── */
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">

      {/* ── VIDEO DE FONDO ── */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/videos/hero-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* ── OVERLAY degradado oscuro sobre el video ── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/80 via-sky-950/75 to-black/85" />

      {/* ── PARTÍCULAS decorativas (anillos animados) ── */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-sky-400/10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border border-blue-400/10 animate-pulse [animation-delay:1s]" />
      </div>

      {/* ── TARJETA PRINCIPAL con glassmorphism + slide-up ── */}
      <div className="relative z-20 w-full max-w-4xl animate-slide-up">
        <div className="backdrop-blur-xl bg-slate-900/75 border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

          {/* ══════════════════════════════════════════════════
              Panel Izquierdo: Identidad Corporativa AeroManager
          ══════════════════════════════════════════════════ */}
          <div className="w-full md:w-5/12 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/15 bg-slate-900/60">
            <div className="flex flex-col gap-5 animate-fade-in [animation-delay:0.2s]">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="AeroManager"
                  className="w-10 h-10 rounded-lg shadow-lg object-cover ring-1 ring-white/20"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white tracking-tight leading-none drop-shadow">
                    AeroManager
                  </span>
                  <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider mt-1">
                    Terminal OPS Suite
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-sm font-semibold text-white/90">
                  Plataforma Centralizada de Gestión Aeroportuaria
                </p>
                <p className="text-xs text-white/75 mt-1.5 leading-relaxed">
                  Sistema integral para administración de infraestructura aeroportuaria, flota aérea,
                  programación de vuelos, asignación de puertas de embarque y emisión de reservas en
                  mostrador.
                </p>
              </div>

              <div className="backdrop-blur-sm bg-white/8 border border-white/12 rounded-xl p-3.5 space-y-2 text-xs text-white/80">
                <div className="font-bold text-[11px] uppercase tracking-wider text-white/40">
                  Módulos por Perfil Operativo
                </div>
                <div className="flex items-center justify-between">
                  <span>Administrador</span>
                  <span className="font-mono-code font-semibold text-sky-300">
                    Catálogos, Flota &amp; Reportes
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Operador de Vuelos</span>
                  <span className="font-mono-code font-semibold text-sky-300">
                    FIDS, Rutas &amp; Gates
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Agente de Counter</span>
                  <span className="font-mono-code font-semibold text-sky-300">
                    Cabina, Check-In &amp; Tickets
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2 animate-fade-in [animation-delay:0.4s]">
              <div className="flex items-center gap-2 text-white/70">
                <span className="material-symbols-outlined text-base text-sky-300">
                  verified_user
                </span>
                <span className="text-xs font-medium">Acceso Seguro con Control de Roles</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <span className="material-symbols-outlined text-base text-emerald-400">
                  event_seat
                </span>
                <span className="text-xs font-medium">Control Transaccional de Asientos</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              Panel Derecho: Formulario de Autenticación
          ══════════════════════════════════════════════════ */}
          <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center bg-slate-900/50">
            <div className="max-w-md w-full mx-auto flex flex-col animate-slide-up [animation-delay:0.15s]">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-white tracking-tight">Acceso Operativo</h2>
                <p className="text-xs text-white/70 mt-1">
                  Ingrese sus credenciales autorizadas para acceder a su consola asignada.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-400/30 text-red-300 text-xs font-medium backdrop-blur-sm">
                  {errorMsg}
                </div>
              )}

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="text-[11px] uppercase text-white/80 font-semibold tracking-wider">
                    Correo Corporativo
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-white/40 text-lg">
                      alternate_email
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@aeromanager.com"
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-white/25 bg-slate-800/70 text-white placeholder-white/40 text-sm outline-none focus:border-sky-400/80 focus:ring-1 focus:ring-sky-400/50 backdrop-blur-sm transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="password" className="text-[11px] uppercase text-white/80 font-semibold tracking-wider">
                    Contraseña
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-white/40 text-lg">
                      lock
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-10 pl-9 pr-10 rounded-lg border border-white/25 bg-slate-800/70 text-white placeholder-white/40 text-sm outline-none focus:border-sky-400/80 focus:ring-1 focus:ring-sky-400/50 backdrop-blur-sm transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-white/40 hover:text-white/80 flex items-center justify-center transition-colors"
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
                  className="w-full h-10 mt-1 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-lg shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <span>{loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </form>

              <p className="mt-6 text-center text-[10px] text-white/25 tracking-wide">
                AeroManager OPS &nbsp;·&nbsp; Acceso Restringido &nbsp;·&nbsp; v2.0
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
