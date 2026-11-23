import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../api/axiosClient';
import {
  AeropuertoDto,
  AsientoVueloDto,
  AvionDto,
  ModeloAvionDto,
  PuertaEmbarqueDto,
  RutaDto,
  TerminalDto,
  VueloDto
} from '../../types/models';

export default function ProgramacionVuelosPage() {
  const [vuelos, setVuelos] = useState<VueloDto[]>([]);
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [modelos, setModelos] = useState<ModeloAvionDto[]>([]);
  const [puertas, setPuertas] = useState<PuertaEmbarqueDto[]>([]);
  const [terminales, setTerminales] = useState<TerminalDto[]>([]);
  const [asientosVuelo, setAsientosVuelo] = useState<AsientoVueloDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [estadoTab, setEstadoTab] = useState<string>('ALL');
  const [terminalFilter, setTerminalFilter] = useState<string>('ALL');

  const isSuperAdmin = (() => {
    try {
      const raw = localStorage.getItem('aeromanager_user');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      const roles: string[] = Array.isArray(parsed?.roles) ? parsed.roles : [];
      return roles.some((r) => r.trim().toLowerCase() === 'superadmin');
    } catch {
      return false;
    }
  })();

  const isVueloCerrado = (est: string) => {
    const up = (est || '').toUpperCase();
    return up.includes('ATERRIZ') || up.includes('CANCEL');
  };

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VueloDto | null>(null);
  const [numeroVuelo, setNumeroVuelo] = useState('');
  const [rutaId, setRutaId] = useState<number>(0);
  const [avionId, setAvionId] = useState<number>(0);
  const [puertaEmbarqueId, setPuertaEmbarqueId] = useState<number>(0);
  const [fechaHoraSalida, setFechaHoraSalida] = useState('');
  const [fechaHoraLlegada, setFechaHoraLlegada] = useState('');
  const [capacidadVuelo, setCapacidadVuelo] = useState<number>(180);
  const [precioBase, setPrecioBase] = useState<number>(120.0);
  const [estado, setEstado] = useState('Programado');
  const [activo, setActivo] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [vRes, rRes, aRes, avRes, mRes, pRes, tRes, avuRes] = await Promise.all([
        axiosClient.get<VueloDto[]>('/vuelos'),
        axiosClient.get<RutaDto[]>('/rutas'),
        axiosClient.get<AeropuertoDto[]>('/aeropuertos'),
        axiosClient.get<AvionDto[]>('/aviones'),
        axiosClient.get<ModeloAvionDto[]>('/modelosavion'),
        axiosClient.get<PuertaEmbarqueDto[]>('/puertasembarque'),
        axiosClient.get<TerminalDto[]>('/terminales'),
        axiosClient.get<AsientoVueloDto[]>('/asientosvuelo')
      ]);
      setVuelos(vRes.data);
      setRutas(rRes.data);
      setAeropuertos(aRes.data);
      setAviones(avRes.data);
      setModelos(mRes.data);
      setPuertas(pRes.data);
      setTerminales(tRes.data);
      setAsientosVuelo(avuRes.data);
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'No se pudo cargar la información del servidor.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toDatetimeLocal = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const openCreate = () => {
    setEditing(null);
    setNumeroVuelo('');
    setRutaId(rutas[0]?.id || 0);
    const firstAvion = aviones[0];
    setAvionId(firstAvion?.id || 0);
    setCapacidadVuelo(firstAvion?.capacidadFisica || 180);
    setPuertaEmbarqueId(puertas[0]?.id || 0);
    const now = new Date();
    const out = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const arr = new Date(out.getTime() + 90 * 60 * 1000);
    setFechaHoraSalida(toDatetimeLocal(out.toISOString()));
    setFechaHoraLlegada(toDatetimeLocal(arr.toISOString()));
    setPrecioBase(120.0);
    setEstado('Programado');
    setActivo(true);
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEdit = (item: VueloDto) => {
    setEditing(item);
    setNumeroVuelo(item.numeroVuelo);
    setRutaId(item.rutaId);
    setAvionId(item.avionId);
    setPuertaEmbarqueId(item.puertaEmbarqueId);
    setFechaHoraSalida(toDatetimeLocal(item.fechaHoraSalida));
    setFechaHoraLlegada(toDatetimeLocal(item.fechaHoraLlegada));
    setCapacidadVuelo(item.capacidadVuelo);
    setPrecioBase(item.precioBase);
    setEstado(item.estado);
    setActivo(item.activo);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const std = new Date(fechaHoraSalida);
    const sta = new Date(fechaHoraLlegada);
    if (sta <= std) {
      setErrorMsg(
        'Regla Cronológica Obligatoria: La fecha y hora de llegada debe ser estrictamente posterior a la fecha y hora de salida.'
      );
      return;
    }

    try {
      if (editing) {
        await axiosClient.put(`/vuelos/${editing.id}`, {
          id: editing.id,
          numeroVuelo: numeroVuelo.trim().toUpperCase(),
          rutaId,
          avionId,
          puertaEmbarqueId,
          fechaHoraSalida: std.toISOString(),
          fechaHoraLlegada: sta.toISOString(),
          capacidadVuelo,
          precioBase,
          estado,
          activo
        });
      } else {
        await axiosClient.post('/vuelos', {
          numeroVuelo: numeroVuelo.trim().toUpperCase(),
          rutaId,
          avionId,
          puertaEmbarqueId,
          fechaHoraSalida: std.toISOString(),
          fechaHoraLlegada: sta.toISOString(),
          capacidadVuelo,
          precioBase,
          estado
        });
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(
        extractApiError(err, 'Error al guardar la programación del vuelo.')
      );
    }
  };

  const handleExportExcel = async () => {
    setErrorMsg(null);
    try {
      const res = await axiosClient.get('/reportes/vuelos-excel', { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Vuelos_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'Error al exportar reporte de vuelos (.xls).'));
    }
  };

  const getRutaLabel = (id: number) => {
    const r = rutas.find((x) => x.id === id);
    if (!r) return `Ruta #${id}`;
    const orig = aeropuertos.find((a) => a.id === r.aeropuertoOrigenId)?.codigoIata || r.aeropuertoOrigenId;
    const dest = aeropuertos.find((a) => a.id === r.aeropuertoDestinoId)?.codigoIata || r.aeropuertoDestinoId;
    return `${orig} → ${dest} (${r.codigoRuta})`;
  };

  const getAvionLabel = (id: number) => {
    const av = aviones.find((x) => x.id === id);
    if (!av) return `AV #${id}`;
    const mod = modelos.find((m) => m.id === av.modeloAvionId);
    return mod ? `${av.matricula} (${mod.nombreModelo})` : av.matricula;
  };

  const getGateLabel = (id: number) => {
    const p = puertas.find((x) => x.id === id);
    return p ? `GATE ${p.codigoGate}` : `Gate #${id}`;
  };

  const getOcupadosPorVuelo = (vueloId: number) =>
    asientosVuelo.filter((av) => av.vueloId === vueloId && av.activo && av.estaOcupado).length;

  const getStatusBadge = (st: string) => {
    const up = st.toUpperCase();
    if (up.includes('ABORD')) return 'bg-amber-50 border-amber-200 text-amber-700';
    if (up.includes('VUELO') || up.includes('ATERRIZ') || up.includes('COMPLET'))
      return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (up.includes('CANCEL') || up.includes('RETRAS'))
      return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-sky-50 border-sky-200 text-[#0284C7]';
  };

  const filtered = vuelos.filter((v) => {
    if (estadoTab !== 'ALL' && v.estado.toUpperCase() !== estadoTab.toUpperCase()) return false;
    if (terminalFilter !== 'ALL') {
      const p = puertas.find((x) => x.id === v.puertaEmbarqueId);
      if (!p || String(p.terminalId) !== terminalFilter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Consola Operador de Vuelos / Planificación de Despacho
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">Programación de Vuelos</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Cronograma de salidas (STD) y llegadas (STA) en Neon
            Cloud PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="h-9 px-3.5 rounded bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            <span>Exportar (.xls)</span>
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Programar Vuelo</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Pestañas Superiores por Estado + Filtro Terminal */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'Programado', 'En Abordaje', 'En Vuelo', 'Aterrizado', 'Cancelado'].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setEstadoTab(tab)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${estadoTab === tab
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                    }`}
                >
                  {tab === 'ALL' ? `Todos (${vuelos.length})` : tab}
                </button>
              )
            )}
          </div>

          <select
            value={terminalFilter}
            onChange={(e) => setTerminalFilter(e.target.value)}
            className="h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
          >
            <option value="ALL">Todas las Terminales</option>
            {terminales.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.codigo} — {t.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla Principal de Vuelos */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID / Vuelo</th>
              <th className="py-2.5 px-4 font-semibold">Ruta / Trayecto</th>
              <th className="py-2.5 px-4 font-semibold">Aeronave</th>
              <th className="py-2.5 px-4 font-semibold">Puerta</th>
              <th className="py-2.5 px-4 font-semibold">Salida (STD)</th>
              <th className="py-2.5 px-4 font-semibold">Llegada (STA)</th>
              <th className="py-2.5 px-4 font-semibold">PAX / CAP</th>
              <th className="py-2.5 px-4 font-semibold">Precio Base</th>
              <th className="py-2.5 px-4 font-semibold">Estado</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Cargando información...'
                    : 'No hay vuelos programados.'}
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const ocupados = getOcupadosPorVuelo(item.id);
                const pct =
                  item.capacidadVuelo > 0
                    ? Math.min(100, Math.round((ocupados / item.capacidadVuelo) * 100))
                    : 0;
                return (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono-code">
                      <span className="text-zinc-400 mr-1.5">#{item.id}</span>
                      <strong className="text-[#0284C7]">{item.numeroVuelo}</strong>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#18181B]">
                      {getRutaLabel(item.rutaId)}
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-700">
                      {getAvionLabel(item.avionId)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code font-bold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-800">
                        {getGateLabel(item.puertaEmbarqueId)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-600">
                      {new Date(item.fechaHoraSalida).toLocaleString('es-PE', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-600">
                      {new Date(item.fechaHoraLlegada).toLocaleString('es-PE', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 w-24">
                        <span className="font-mono-code text-[11px] text-zinc-700">
                          {ocupados} / {item.capacidadVuelo} ({pct}%)
                        </span>
                        <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0284C7]"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono-code font-semibold text-emerald-700">
                      ${item.precioBase.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${getStatusBadge(
                          item.estado
                        )}`}
                      >
                        {item.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isVueloCerrado(item.estado) && !isSuperAdmin ? (
                        <span
                          title="Vuelo histórico cerrado: solo SuperAdmin puede modificarlo"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 border border-zinc-200 text-zinc-400 font-medium cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[14px]">lock</span>
                          <span>Cerrado</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="px-2.5 py-1 rounded bg-[#F4F4F5] hover:bg-zinc-200 text-zinc-700 font-medium cursor-pointer"
                        >
                          {isVueloCerrado(item.estado) && isSuperAdmin
                            ? 'Override SA'
                            : 'Editar / Estado'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Programar / Editar Vuelo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">
                {editing ? 'Editar Vuelo Programado' : 'Programar Nuevo Vuelo Comercial'}
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
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs">
                <strong>Regla Cronológica Obligatoria:</strong> La fecha y hora
                de llegada debe ser estrictamente posterior a la fecha y hora de salida. La capacidad
                y precio base deben ser mayores a cero.
              </div>
              {editing && isVueloCerrado(editing.estado) && isSuperAdmin && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                  <strong>Modo Override SuperAdmin:</strong> Estás editando un vuelo histórico en
                  estado <strong>{editing.estado}</strong>.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="vuelo-numero"
                    className="block text-[11px] font-bold uppercase text-zinc-700 mb-1"
                  >
                    Número de Vuelo (Ej. AM-510)
                  </label>
                  <input
                    id="vuelo-numero"
                    name="numeroVuelo"
                    type="text"
                    required
                    value={numeroVuelo}
                    onChange={(e) => setNumeroVuelo(e.target.value.toUpperCase())}
                    placeholder="AM-510"
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs uppercase outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="vuelo-ruta"
                    className="block text-[11px] font-bold uppercase text-zinc-700 mb-1"
                  >
                    Seleccionar Ruta Aérea
                  </label>
                  <select
                    id="vuelo-ruta"
                    name="rutaId"
                    required
                    value={rutaId}
                    onChange={(e) => setRutaId(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                  >
                    {rutas.map((r) => (
                      <option key={r.id} value={r.id}>
                        {getRutaLabel(r.id)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="vuelo-avion"
                    className="block text-[11px] font-bold uppercase text-zinc-700 mb-1"
                  >
                    Seleccionar Avión Operativo
                  </label>
                  <select
                    id="vuelo-avion"
                    name="avionId"
                    required
                    value={avionId}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setAvionId(id);
                      const av = aviones.find((x) => x.id === id);
                      if (av) setCapacidadVuelo(av.capacidadFisica);
                    }}
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                  >
                    {aviones.map((av) => (
                      <option key={av.id} value={av.id}>
                        {av.matricula} ({av.capacidadFisica} PAX - {av.estadoOperativo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="vuelo-puerta"
                    className="block text-[11px] font-bold uppercase text-zinc-700 mb-1"
                  >
                    Puerta de Embarque (Gate)
                  </label>
                  <select
                    id="vuelo-puerta"
                    name="puertaEmbarqueId"
                    required
                    value={puertaEmbarqueId}
                    onChange={(e) => setPuertaEmbarqueId(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                  >
                    {puertas.map((p) => {
                      const inMaint = p.estado.toUpperCase().includes('MANTEN');
                      return (
                        <option key={p.id} value={p.id} disabled={inMaint}>
                          GATE {p.codigoGate} ({inMaint ? 'Mantenimiento — No disponible' : p.estado})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="vuelo-salida"
                    className="block text-[11px] font-bold uppercase text-zinc-700 mb-1"
                  >
                    Fecha y Hora de Salida (STD)
                  </label>
                  <input
                    id="vuelo-salida"
                    name="fechaHoraSalida"
                    type="datetime-local"
                    required
                    value={fechaHoraSalida}
                    onChange={(e) => setFechaHoraSalida(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="vuelo-llegada"
                    className="block text-[11px] font-bold uppercase text-zinc-700 mb-1"
                  >
                    Fecha y Hora de Llegada (STA)
                  </label>
                  <input
                    id="vuelo-llegada"
                    name="fechaHoraLlegada"
                    type="datetime-local"
                    required
                    value={fechaHoraLlegada}
                    onChange={(e) => setFechaHoraLlegada(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="vuelo-capacidad"
                    className="block text-[11px] font-bold uppercase text-zinc-700 mb-1"
                  >
                    Capacidad del Vuelo (&gt; 0)
                  </label>
                  <input
                    id="vuelo-capacidad"
                    name="capacidadVuelo"
                    type="number"
                    required
                    min={1}
                    max={900}
                    value={capacidadVuelo}
                    onChange={(e) => setCapacidadVuelo(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="vuelo-precio"
                    className="block text-[11px] font-bold uppercase text-zinc-700 mb-1"
                  >
                    Precio Base (USD &gt; 0)
                  </label>
                  <input
                    id="vuelo-precio"
                    name="precioBase"
                    type="number"
                    step="0.50"
                    required
                    min={1}
                    max={50000}
                    value={precioBase}
                    onChange={(e) => setPrecioBase(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="vuelo-estado"
                    className="block text-[11px] font-bold uppercase text-zinc-700 mb-1"
                  >
                    Estado Operativo
                  </label>
                  <select
                    id="vuelo-estado"
                    name="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                  >
                    <option value="Programado">Programado</option>
                    <option value="En Abordaje">En Abordaje</option>
                    <option value="En Vuelo">En Vuelo</option>
                    <option value="Aterrizado">Aterrizado</option>
                    <option value="Retrasado">Retrasado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
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
                  Guardar Programación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
