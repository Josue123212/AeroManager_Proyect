import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  AeropuertoDto,
  AsientoVueloDto,
  AvionDto,
  ModeloAvionDto,
  PuertaEmbarqueDto,
  RutaDto,
  VueloDto
} from '../../types/models';

export default function CarteleraVuelosCounterPage() {
  const navigate = useNavigate();
  const [vuelos, setVuelos] = useState<VueloDto[]>([]);
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [modelos, setModelos] = useState<ModeloAvionDto[]>([]);
  const [puertas, setPuertas] = useState<PuertaEmbarqueDto[]>([]);
  const [asientosVuelo, setAsientosVuelo] = useState<AsientoVueloDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [origenFilter, setOrigenFilter] = useState<string>('ALL');
  const [destinoFilter, setDestinoFilter] = useState<string>('ALL');
  const [searchVuelo, setSearchVuelo] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [vRes, rRes, aRes, avRes, mRes, pRes, avuRes] = await Promise.all([
        axiosClient.get<VueloDto[]>('/vuelos'),
        axiosClient.get<RutaDto[]>('/rutas'),
        axiosClient.get<AeropuertoDto[]>('/aeropuertos'),
        axiosClient.get<AvionDto[]>('/aviones'),
        axiosClient.get<ModeloAvionDto[]>('/modelosavion'),
        axiosClient.get<PuertaEmbarqueDto[]>('/puertasembarque'),
        axiosClient.get<AsientoVueloDto[]>('/asientosvuelo')
      ]);
      setVuelos(vRes.data);
      setRutas(rRes.data);
      setAeropuertos(aRes.data);
      setAviones(avRes.data);
      setModelos(mRes.data);
      setPuertas(pRes.data);
      setAsientosVuelo(avuRes.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al consultar GET /api/vuelos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const vuelosDisponibles = vuelos.filter(
    (v) => v.activo && v.estado.toUpperCase() !== 'CANCELADO'
  );
  const totalAsientosLibres = asientosVuelo.filter(
    (av) => av.activo && !av.estaOcupado
  ).length;

  const handleSeleccionarVueloParaReserva = (vueloId: number) => {
    localStorage.setItem('aeromanager_counter_vuelo_id', String(vueloId));
    navigate('/counter/cabina');
  };

  const filtered = vuelosDisponibles.filter((v) => {
    const r = rutas.find((x) => x.id === v.rutaId);
    if (origenFilter !== 'ALL' && (!r || String(r.aeropuertoOrigenId) !== origenFilter))
      return false;
    if (destinoFilter !== 'ALL' && (!r || String(r.aeropuertoDestinoId) !== destinoFilter))
      return false;
    if (searchVuelo.trim()) {
      const q = searchVuelo.toLowerCase();
      return (
        v.numeroVuelo.toLowerCase().includes(q) ||
        (r && r.codigoRuta.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera + 2 Contadores en Vivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Terminal de Mostrador Counter / 1. Cartelera Comercial
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">
            Cartelera de Vuelos Disponibles para Reserva
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Seleccione un vuelo activo para abrir su mapa visual de cabina y asignar asiento en
            tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-zinc-200 shadow-2xs flex items-center gap-2.5">
            <span className="material-symbols-outlined text-emerald-600">event_seat</span>
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">
                Total Asientos Libres
              </span>
              <span className="font-mono-code text-base font-bold text-emerald-700">
                {totalAsientosLibres} Butacas
              </span>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-[#F4F4F5] border border-zinc-200 shadow-2xs flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#0284C7]">flight_takeoff</span>
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">
                Vuelos Disponibles
              </span>
              <span className="font-mono-code text-base font-bold text-[#18181B]">
                {vuelosDisponibles.length} Vuelos
              </span>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Barra de Filtros en Contenedor Carbón Claro (#F4F4F5) */}
      <div className="p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
              Aeropuerto de Origen
            </label>
            <select
              value={origenFilter}
              onChange={(e) => setOrigenFilter(e.target.value)}
              className="w-full h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">Todos los Orígenes</option>
              {aeropuertos.map((a) => (
                <option key={a.id} value={String(a.id)}>
                  {a.codigoIata} — {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
              Aeropuerto de Destino
            </label>
            <select
              value={destinoFilter}
              onChange={(e) => setDestinoFilter(e.target.value)}
              className="w-full h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">Todos los Destinos</option>
              {aeropuertos.map((a) => (
                <option key={a.id} value={String(a.id)}>
                  {a.codigoIata} — {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
              Búsqueda Rápida por Número de Vuelo / Ruta
            </label>
            <input
              type="text"
              value={searchVuelo}
              onChange={(e) => setSearchVuelo(e.target.value)}
              placeholder="Ej. AM-402 o LIM-CUZ..."
              className="w-full h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            />
          </div>
        </div>

        {/* Chips de Rutas Registradas en BD */}
        {rutas.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-zinc-500 mr-1">
              Rutas Activas en BD:
            </span>
            <button
              type="button"
              onClick={() => {
                setOrigenFilter('ALL');
                setDestinoFilter('ALL');
                setSearchVuelo('');
              }}
              className="px-2.5 py-1 rounded bg-white border border-zinc-300 text-xs font-medium text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Ver Todas
            </button>
            {rutas.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSearchVuelo(r.codigoRuta)}
                className="px-2.5 py-1 rounded bg-white border border-zinc-300 font-mono-code text-xs font-semibold text-[#0284C7] hover:bg-sky-50 cursor-pointer"
              >
                {r.codigoRuta}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grilla de Tarjetas de Vuelos */}
      {filtered.length === 0 ? (
        <div className="p-10 bg-white border border-zinc-200 rounded-xl text-center text-xs text-zinc-500">
          {loading
            ? 'Consultando cartelera de vuelos en Neon Cloud PostgreSQL...'
            : 'No hay vuelos disponibles en la base de datos. Programe un vuelo en la Consola Operador.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v) => {
            const ruta = rutas.find((r) => r.id === v.rutaId);
            const orig = ruta
              ? aeropuertos.find((a) => a.id === ruta.aeropuertoOrigenId)
              : null;
            const dest = ruta
              ? aeropuertos.find((a) => a.id === ruta.aeropuertoDestinoId)
              : null;
            const av = aviones.find((x) => x.id === v.avionId);
            const mod = av ? modelos.find((m) => m.id === av.modeloAvionId) : null;
            const gate = puertas.find((p) => p.id === v.puertaEmbarqueId);

            const asientosDeEsteVuelo = asientosVuelo.filter(
              (x) => x.vueloId === v.id && x.activo
            );
            const libresVuelo = asientosDeEsteVuelo.filter((x) => !x.estaOcupado).length;
            const totalHabilitados = asientosDeEsteVuelo.length || v.capacidadVuelo;
            const pctLibre =
              totalHabilitados > 0 ? Math.round((libresVuelo / totalHabilitados) * 100) : 100;

            return (
              <div
                key={v.id}
                className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
                  <div>
                    <span className="font-mono-code text-sm font-bold text-[#0284C7]">
                      {v.numeroVuelo}
                    </span>
                    <span className="block font-mono-code text-[11px] text-zinc-500">
                      {mod ? `${mod.fabricante} ${mod.nombreModelo}` : 'Aeronave'} ·{' '}
                      {av ? av.matricula : `AV #${v.avionId}`}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded border font-mono-code text-[11px] font-semibold bg-emerald-50 border-emerald-200 text-emerald-700">
                    {v.estado}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Trayecto IATA Origen ✈️ Destino */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono-code text-2xl font-bold text-[#18181B]">
                        {orig ? orig.codigoIata : 'ORI'}
                      </span>
                      <span className="block text-[11px] text-zinc-500">
                        {new Date(v.fechaHoraSalida).toLocaleTimeString('es-PE', {
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>

                    <div className="flex flex-col items-center flex-1 px-3">
                      <span className="text-[10px] font-mono-code text-zinc-400">
                        {ruta ? `${ruta.duracionEstimadaMinutos} min` : 'Directo'}
                      </span>
                      <div className="w-full flex items-center gap-1 my-1">
                        <div className="flex-1 h-px bg-zinc-300"></div>
                        <span className="material-symbols-outlined text-[#0284C7] text-base">
                          flight
                        </span>
                        <div className="flex-1 h-px bg-zinc-300"></div>
                      </div>
                      <span className="font-mono-code text-[10px] text-zinc-500">
                        {gate ? `Gate ${gate.codigoGate}` : `Gate #${v.puertaEmbarqueId}`}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono-code text-2xl font-bold text-[#18181B]">
                        {dest ? dest.codigoIata : 'DES'}
                      </span>
                      <span className="block text-[11px] text-zinc-500">
                        {new Date(v.fechaHoraLlegada).toLocaleTimeString('es-PE', {
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Disponibilidad y Precio Base */}
                  <div className="p-3 rounded-lg bg-[#F4F4F5] border border-zinc-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600">Asientos Libres en Cabina:</span>
                      <span className="font-mono-code font-bold text-emerald-700">
                        {libresVuelo} libres / {v.capacidadVuelo} CAP
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600"
                        style={{ width: `${pctLibre}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-200/80">
                      <span className="text-[11px] text-zinc-500">Tarifa Base Counter:</span>
                      <span className="font-mono-code text-sm font-bold text-[#18181B]">
                        ${v.precioBase.toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSeleccionarVueloParaReserva(v.id)}
                    className="w-full h-9 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      airline_seat_recline_normal
                    </span>
                    <span>Abrir Mapa de Asientos / Reservar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
