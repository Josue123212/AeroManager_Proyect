import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { extractApiError } from '../../api/axiosClient';
import {
  DetalleReservaDto,
  PaisDto,
  PasajeroDto,
  TipoDocumentoDto
} from '../../types/models';

export default function PadronPasajerosCounterPage() {
  const navigate = useNavigate();
  const [pasajeros, setPasajeros] = useState<PasajeroDto[]>([]);
  const [tiposDoc, setTiposDoc] = useState<TipoDocumentoDto[]>([]);
  const [paises, setPaises] = useState<PaisDto[]>([]);
  const [detallesReserva, setDetallesReserva] = useState<DetalleReservaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [tipoDocFilter, setTipoDocFilter] = useState<string>('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PasajeroDto | null>(null);
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [tipoDocumentoId, setTipoDocumentoId] = useState<number>(0);
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nacionalidadPaisId, setNacionalidadPaisId] = useState<number>(0);
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [pRes, tdRes, paRes, drRes] = await Promise.all([
        axiosClient.get<PasajeroDto[]>('/pasajeros'),
        axiosClient.get<TipoDocumentoDto[]>('/tiposdocumento'),
        axiosClient.get<PaisDto[]>('/paises'),
        axiosClient.get<DetalleReservaDto[]>('/detallesreserva')
      ]);
      setPasajeros(pRes.data);
      setTiposDoc(tdRes.data);
      setPaises(paRes.data);
      setDetallesReserva(drRes.data);
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
    setNombres('');
    setApellidos('');
    setTipoDocumentoId(tiposDoc[0]?.id || 0);
    setNumeroDocumento('');
    setEmail('');
    setTelefono('');
    setNacionalidadPaisId(paises[0]?.id || 0);
    setActivo(true);
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEdit = (item: PasajeroDto) => {
    setEditing(item);
    setNombres(item.nombres);
    setApellidos(item.apellidos);
    setTipoDocumentoId(item.tipoDocumentoId);
    setNumeroDocumento(item.numeroDocumento);
    setEmail(item.email);
    setTelefono(item.telefono || '');
    setNacionalidadPaisId(item.nacionalidadPaisId);
    setActivo(item.activo);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent, goToCabinAfter: boolean) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editing) {
        await axiosClient.put(`/pasajeros/${editing.id}`, {
          id: editing.id,
          nombres,
          apellidos,
          tipoDocumentoId,
          numeroDocumento,
          email,
          telefono,
          nacionalidadPaisId,
          activo
        });
      } else {
        const res = await axiosClient.post<PasajeroDto>('/pasajeros', {
          nombres,
          apellidos,
          tipoDocumentoId,
          numeroDocumento,
          email,
          telefono,
          nacionalidadPaisId
        });
        if (goToCabinAfter && res.data?.id) {
          localStorage.setItem('aeromanager_counter_pasajero_id', String(res.data.id));
        }
      }
      setShowModal(false);
      await loadData();
      if (goToCabinAfter) {
        navigate('/counter/cabina');
      }
    } catch (err: any) {
      setErrorMsg(
        extractApiError(err, 'Error al guardar los datos del pasajero.')
      );
    }
  };

  const handleIniciarReservaPasajero = (pasajeroId: number) => {
    localStorage.setItem('aeromanager_counter_pasajero_id', String(pasajeroId));
    navigate('/counter/cabina');
  };

  const filtered = pasajeros.filter((p) => {
    if (tipoDocFilter !== 'ALL' && String(p.tipoDocumentoId) !== tipoDocFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.nombres.toLowerCase().includes(q) ||
        p.apellidos.toLowerCase().includes(q) ||
        p.numeroDocumento.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Terminal de Mostrador Counter / 3. Nómina de Viajeros
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">
            Padrón General de Pasajeros en Mostrador
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Registro e identificación de pasajeros vinculados a TipoDocumento y Pais
            PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Registrar Nuevo Pasajero</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Barra de Búsqueda + Filtro por Tipo de Documento */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por DNI, Pasaporte, Nombres o Apellidos..."
              className="w-80 h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            />

            <select
              value={tipoDocFilter}
              onChange={(e) => setTipoDocFilter(e.target.value)}
              className="h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">Todos los Tipos de Documento</option>
              {tiposDoc.map((td) => (
                <option key={td.id} value={String(td.id)}>
                  {td.codigo} — {td.nombre}
                </option>
              ))}
            </select>
          </div>
          <span className="font-mono-code text-xs text-zinc-600">
            Pasajeros: <strong>{filtered.length}</strong>
          </span>
        </div>

        {/* Tabla de Pasajeros */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Documento</th>
              <th className="py-2.5 px-4 font-semibold">Nombres y Apellidos</th>
              <th className="py-2.5 px-4 font-semibold">Contacto (Email / Teléfono)</th>
              <th className="py-2.5 px-4 font-semibold">Nacionalidad</th>
              <th className="py-2.5 px-4 font-semibold">Reservas Activas</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones Counter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Cargando información...'
                    : 'No hay pasajeros registrados.'}
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const td = tiposDoc.find((t) => t.id === item.tipoDocumentoId);
                const pais = paises.find((p) => p.id === item.nacionalidadPaisId);
                const reservasCount = detallesReserva.filter(
                  (dr) => dr.pasajeroId === item.id && dr.activo
                ).length;

                return (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code font-bold px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7] mr-1.5">
                        {td ? td.codigo : 'DOC'}
                      </span>
                      <span className="font-mono-code font-semibold text-[#18181B]">
                        {item.numeroDocumento}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#18181B]">
                      {item.nombres} {item.apellidos}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono-code text-[#0284C7]">{item.email}</div>
                      <div className="font-mono-code text-[11px] text-zinc-500">
                        {item.telefono || 'Sin teléfono'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-700">
                      {pais ? `${pais.nombre} (${pais.codigoIso})` : `País #${item.nacionalidadPaisId}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                        {reservasCount} {reservasCount === 1 ? 'Boleto' : 'Boletos'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="px-2.5 py-1 rounded bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700 font-medium cursor-pointer"
                      >
                        Editar Datos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleIniciarReservaPasajero(item.id)}
                        className="px-2.5 py-1 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold cursor-pointer"
                      >
                        Iniciar Reserva →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Registrar / Editar Pasajero (7 campos exactos de CreatePasajeroCommand) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">
                {editing ? 'Editar Datos del Pasajero' : 'Registrar Nuevo Pasajero en Mostrador'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => handleSave(e, false)}
              className="p-5 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Nombres del Pasajero
                  </label>
                  <input
                    type="text"
                    required
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Ej. Valeria"
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Apellidos del Pasajero
                  </label>
                  <input
                    type="text"
                    required
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Ej. Gómez Rojas"
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    required
                    value={tipoDocumentoId}
                    onChange={(e) => setTipoDocumentoId(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                  >
                    {tiposDoc.map((td) => (
                      <option key={td.id} value={td.id}>
                        {td.codigo} — {td.nombre} (Máx {td.longitudMaxima})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Número de Documento (Único)
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value.toUpperCase())}
                    placeholder="74819203"
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pasajero@correo.com"
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Teléfono Móvil de Contacto
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+51 987654321"
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  País de Nacionalidad
                </label>
                <select
                  required
                  value={nacionalidadPaisId}
                  onChange={(e) => setNacionalidadPaisId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {paises.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.codigoIso})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-9 px-4 rounded bg-[#F4F4F5] text-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Guardar Pasajero
                </button>
                {!editing && (
                  <button
                    type="button"
                    onClick={(e) => handleSave(e, true)}
                    className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold cursor-pointer"
                  >
                    Guardar y Continuar a Reserva →
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
