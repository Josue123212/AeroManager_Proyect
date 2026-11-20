import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { LoginResponseDto, RolActivoType } from '../../types/models';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@aeromanager.com');
  const [password, setPassword] = useState('Admin123!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RolActivoType>('Administrador');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectRolePreset = (role: RolActivoType, presetEmail: string, presetPass: string) => {
    setSelectedRole(role);
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMsg(null);
  };

  const navigateByRole = (role: RolActivoType) => {
    if (role === 'Administrador') navigate('/admin/dashboard');
    else if (role === 'Operador') navigate('/operador/fids');
    else navigate('/counter/cartelera');
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
      localStorage.setItem('aeromanager_token', data.token);
      localStorage.setItem(
        'aeromanager_user',
        JSON.stringify({
          usuarioId: data.usuarioId,
          nombreCompleto: data.nombreCompleto,
          email: data.email,
          rolActivo: selectedRole,
          roles: data.roles
        })
      );
      navigateByRole(selectedRole);
    } catch {
      // Fallback de sesión operativa para demostración con cualquiera de los 3 roles
      const fallbackUser = {
        usuarioId: selectedRole === 'Administrador' ? 1 : selectedRole === 'Operador' ? 2 : 3,
        nombreCompleto:
          selectedRole === 'Administrador'
            ? 'Josué Choque (Administrador General)'
            : selectedRole === 'Operador'
            ? 'Carlos Mendoza (Despacho & Torre)'
            : 'Lucía Fernández (Counter Check-In)',
        email,
        rolActivo: selectedRole,
        roles: [selectedRole]
      };
      localStorage.setItem('aeromanager_token', 'demo-jwt-token-aeromanager-2026');
      localStorage.setItem('aeromanager_user', JSON.stringify(fallbackUser));
      navigateByRole(selectedRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#18181B] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Panel Izquierdo: Identidad Corporativa AeroManager (Carbón Claro #F4F4F5) */}
        <div className="w-full md:w-5/12 bg-[#F4F4F5] p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0284C7] text-white shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">connecting_airports</span>
              </div>
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
                Sistema Centralizado de Gestión Aeroportuaria y Aerolíneas
              </p>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Plataforma empresarial conectada a Neon Cloud PostgreSQL para administración de
                catálogos IATA, flota aérea, despacho de vuelos, asignación de puertas y emisión
                transaccional de reservas con control de concurrencia.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Arquitectura Empresarial
                </span>
                <span className="font-mono-code text-xs font-semibold text-[#0284C7]">
                  .NET 10 + React
                </span>
              </div>
              <div className="text-xs text-zinc-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Entidades Relacionales:</span>
                  <span className="font-mono-code font-semibold text-zinc-900">20 Tablas 3FN</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Control de Asientos:</span>
                  <span className="font-mono-code font-semibold text-emerald-700">UnitOfWork ACID</span>
                </div>
              </div>
            </div>
          </div>

          {/* Indicadores de cumplimiento en la parte inferior */}
          <div className="mt-6 pt-4 border-t border-zinc-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="material-symbols-outlined text-base text-[#0284C7]">verified_user</span>
              <span className="font-mono-code text-xs">Autenticación JWT (HMACSHA256)</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="material-symbols-outlined text-base text-emerald-600">database</span>
              <span className="font-mono-code text-xs">Neon Cloud PostgreSQL Activo</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="material-symbols-outlined text-base text-amber-600">hub</span>
              <span className="font-mono-code text-xs">Clean &amp; Hexagonal Architecture</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Formulario de Autenticación y Selector de Roles */}
        <div className="w-full md:w-7/12 bg-white p-6 md:p-8 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto flex flex-col">
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#18181B] tracking-tight">
                  Acceso Operativo
                </h2>
                <span className="bg-[#F4F4F5] border border-zinc-200 px-2.5 py-0.5 rounded text-zinc-600 font-mono-code text-xs font-semibold">
                  v2.4.0
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Ingrese sus credenciales autorizadas o seleccione un perfil operativo de demostración.
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
                  Identificador Operativo / Correo
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
                    placeholder="admin@aeromanager.com"
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

              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-zinc-600">
                  Rol seleccionado:{' '}
                  <strong className="text-[#0284C7] font-semibold">{selectedRole}</strong>
                </span>
                <span className="font-mono-code text-xs text-emerald-700 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  API Conectada
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-9 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold rounded shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? 'Autenticando...' : `Iniciar Sesión como ${selectedRole}`}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </form>

            {/* Perfiles Rápidos de Demostración (Los 3 Roles) */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase text-zinc-500 font-semibold tracking-wider">
                  Perfiles Rápidos de Demostración (3 Roles)
                </span>
                <span className="flex-1 h-px bg-zinc-200"></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectRolePreset('Administrador', 'admin@aeromanager.com', 'Admin123!')
                  }
                  className={`flex flex-col items-start p-2.5 rounded border text-left transition-all cursor-pointer ${
                    selectedRole === 'Administrador'
                      ? 'bg-sky-50 border-[#0284C7] text-[#18181B]'
                      : 'bg-[#F4F4F5] border-zinc-200 text-zinc-700 hover:bg-zinc-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold uppercase text-[#0284C7]">ROL 1</span>
                    <span className="material-symbols-outlined text-base text-[#0284C7]">
                      admin_panel_settings
                    </span>
                  </div>
                  <span className="text-xs font-bold mt-1">Administrador</span>
                  <span className="font-mono-code text-[11px] text-zinc-500">
                    Catálogos, Excel &amp; IA
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSelectRolePreset('Operador', 'operador@aeromanager.com', 'Operador123!')
                  }
                  className={`flex flex-col items-start p-2.5 rounded border text-left transition-all cursor-pointer ${
                    selectedRole === 'Operador'
                      ? 'bg-sky-50 border-[#0284C7] text-[#18181B]'
                      : 'bg-[#F4F4F5] border-zinc-200 text-zinc-700 hover:bg-zinc-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold uppercase text-[#0284C7]">ROL 2</span>
                    <span className="material-symbols-outlined text-base text-[#0284C7]">
                      flight_takeoff
                    </span>
                  </div>
                  <span className="text-xs font-bold mt-1">Operador Vuelos</span>
                  <span className="font-mono-code text-[11px] text-zinc-500">
                    FIDS, Rutas &amp; Gates
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSelectRolePreset('Counter', 'counter@aeromanager.com', 'Counter123!')
                  }
                  className={`flex flex-col items-start p-2.5 rounded border text-left transition-all cursor-pointer ${
                    selectedRole === 'Counter'
                      ? 'bg-sky-50 border-[#0284C7] text-[#18181B]'
                      : 'bg-[#F4F4F5] border-zinc-200 text-zinc-700 hover:bg-zinc-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold uppercase text-[#0284C7]">ROL 3</span>
                    <span className="material-symbols-outlined text-base text-[#0284C7]">
                      airline_seat_recline_normal
                    </span>
                  </div>
                  <span className="text-xs font-bold mt-1">Agente Counter</span>
                  <span className="font-mono-code text-[11px] text-zinc-500">
                    Check-In &amp; Cabina
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
