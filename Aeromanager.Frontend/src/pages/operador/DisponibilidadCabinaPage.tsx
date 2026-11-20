import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../api/axiosClient';
import {
  AsientoDto,
  AsientoVueloDto,
  ClaseAsientoDto,
  RutaDto,
  VueloDto
} from '../../types/models';

export default function DisponibilidadCabinaPage() {
  const [vuelos, setVuelos] = useState<VueloDto[]>([]);
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [asientos, setAsientos] = useState<AsientoDto[]>([]);
  const [clases, setClases] = useState<ClaseAsientoDto[]>([]);
  const [asientosVuelo, setAsientosVuelo] = useState<AsientoVueloDto[]>([]);
  const [selectedVueloId, setSelectedVueloId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [claseFilter, setClaseFilter] = useState<string>('ALL');
  const [estadoFilter, setEstadoFilter] = useState<string>('ALL');

  const [showModal, setShowModal] = useState(false);
  const [modalAsientoId, setModalAsientoId] = useState<number>(0);
  const [modalEstadoConcurrencia, setModalEstadoConcurrencia] = useState('Disponible');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [vRes, rRes, aRes, cRes, avRes] = await Promise.all([
        axiosClient.get<VueloDto[]>('/vuelos'),
        axiosClient.get<RutaDto[]>('/rutas'),
        axiosClient.get<AsientoDto[]>('/asientos'),
        axiosClient.get<ClaseAsientoDto[]>('/clasesasiento'),
        axiosClient.get<AsientoVueloDto[]>('/asientosvuelo')
      ]);
      setVuelos(vRes.data);
      setRutas(rRes.data);
      setAsientos(aRes.data);
      setClases(cRes.data);
      setAsientosVuelo(avRes.data);
      if (selectedVueloId === 0 && vRes.data.length > 0) {
        setSelectedVueloId(vRes.data[0].id);
      }
    } catch (err: any) {
      setErrorMsg(
        extractApiError(err, 'No se pudo cargar la información del servidor.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentVuelo = vuelos.find((v) => v.id === selectedVueloId);
  const asientosDelAvion = currentVuelo
    ? asientos.filter((a) => a.avionId === currentVuelo.avionId && a.activo)
    : [];

  const cabinaDelVuelo = asientosVuelo.filter(
    (av) => av.vueloId === selectedVueloId && av.activo
  );

  const totalCabina = cabinaDelVuelo.length;
  const libres = cabinaDelVuelo.filter(
    (av) => !av.estaOcupado && av.estadoConcurrencia.toUpperCase() !== 'BLOQUEADO'
  ).length;
  const ocupados = cabinaDelVuelo.filter((av) => av.estaOcupado).length;
  const bloqueados = cabinaDelVuelo.filter(
    (av) => av.estadoConcurrencia.toUpperCase() === 'BLOQUEADO'
  ).length;
  const loadFactorPct = totalCabina > 0 ? Math.round((ocupados / totalCabina) * 100) : 0;

  const getUbicacionPorLetra = (letra: string) => {
    const ch = (letra || '').toUpperCase();
    if (ch === 'A' || ch === 'F') return 'Ventana';
    if (ch === 'C' || ch === 'D') return 'Pasillo';
    return 'Centro';
  };

  const openModal = () => {
    const yaHabilitadosIds = new Set(cabinaDelVuelo.map((x) => x.asientoId));
    const disponiblesParaAgregar = asientosDelAvion.filter((a) => !yaHabilitadosIds.has(a.id));
    setModalAsientoId(disponiblesParaAgregar[0]?.id || asientosDelAvion[0]?.id || 0);
    setModalEstadoConcurrencia('Disponible');
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVueloId || !modalAsientoId) return;
    setErrorMsg(null);
    try {
      await axiosClient.post('/asientosvuelo', {
        vueloId: selectedVueloId,
        asientoId: modalAsientoId,
        estaOcupado: false,
        estadoConcurrencia: modalEstadoConcurrencia
      });
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(
        extractApiError(err, 'Error al habilitar el asiento en el vuelo.')
      );
    }
  };

  const handleHabilitarTodaLaCabina = async () => {
    if (!currentVuelo) return;
    setProcessingBatch(true);
    setErrorMsg(null);
    try {
      const yaHabilitados = new Set(cabinaDelVuelo.map((x) => x.asientoId));
      const faltantes = asientosDelAvion.filter((a) => !yaHabilitados.has(a.id));
      for (const asiento of faltantes) {
        await axiosClient.post('/asientosvuelo', {
          vueloId: currentVuelo.id,
          asientoId: asiento.id,
          estaOcupado: false,
          estadoConcurrencia: 'Disponible'
        });
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(
        extractApiError(err, 'Error al habilitar masivamente los asientos de la aeronave.')
      );
    } finally {
      setProcessingBatch(false);
    }
  };

  const handleToggleBloqueoOLiberar = async (
    item: AsientoVueloDto,
    nuevoOcupado: boolean,
    nuevoEstado: string
  ) => {
    setErrorMsg(null);
    try {
      await axiosClient.put(`/asientosvuelo/${item.id}`, {
        id: item.id,
        vueloId: item.vueloId,
        asientoId: item.asientoId,
        estaOcupado: nuevoOcupado,
        estadoConcurrencia: nuevoEstado,
        activo: item.activo
      });
      await loadData();
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'Error al actualizar el estado del asiento.'));
    }
  };

  const filteredCabina = cabinaDelVuelo.filter((item) => {
    const asientoFisico = asientos.find((a) => a.id === item.asientoId);
    if (claseFilter !== 'ALL') {
      if (!asientoFisico || String(asientoFisico.claseAsientoId) !== claseFilter) return false;
    }
    if (estadoFilter === 'LIBRE' && item.estaOcupado) return false;
    if (estadoFilter === 'OCUPADO' && !item.estaOcupado) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Consola Operador de Vuelos / Inventario de Cabina (AsientoVuelo)
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">
            Disponibilidad de Cabina por Vuelo
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Control de concurrencia y bloqueo transaccional de butacas por vuelo
            PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedVueloId}
            onChange={(e) => setSelectedVueloId(Number(e.target.value))}
            className="h-9 px-3 rounded border border-zinc-300 bg-white font-mono-code text-xs font-semibold text-[#0284C7] outline-none focus:border-[#0284C7]"
          >
            {vuelos.length === 0 && <option value={0}>Sin vuelos</option>}
            {vuelos.map((v) => {
              const r = rutas.find((x) => x.id === v.rutaId);
              return (
                <option key={v.id} value={v.id}>
                  Vuelo: {v.numeroVuelo} ({r ? r.codigoRuta : `Ruta #${v.rutaId}`})
                </option>
              );
            })}
          </select>

          <button
            type="button"
            onClick={openModal}
            disabled={!currentVuelo}
            className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Habilitar Asiento en Vuelo</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* 4 Contadores + Barra de Load Factor */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-zinc-500">Total Cabina</span>
          <div className="text-2xl font-bold text-[#18181B] mt-1">{totalCabina} Butacas</div>
        </div>
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-emerald-700">Libres</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{libres} Disponibles</div>
        </div>
        <div className="p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-red-700">Ocupados</span>
          <div className="text-2xl font-bold text-red-700 mt-1">{ocupados} Reservados</div>
        </div>
        <div className="p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-amber-700">Bloqueados</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{bloqueados} Retenidos</div>
        </div>
      </div>

      {/* Barra Load Factor */}
      <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span>Ocupación General de Cabina (Load Factor)</span>
          <span className="font-mono-code text-[#0284C7]">{loadFactorPct}% Ocupado</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0284C7] transition-all"
            style={{ width: `${loadFactorPct}%` }}
          ></div>
        </div>
      </div>

      {/* Tabla de AsientoVuelo */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select
              value={claseFilter}
              onChange={(e) => setClaseFilter(e.target.value)}
              className="h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">Todas las Clases Comerciales</option>
              {clases.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.nombre} (x{c.multiplicadorTarifa})
                </option>
              ))}
            </select>

            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="LIBRE">Solo Libres</option>
              <option value="OCUPADO">Solo Ocupados</option>
            </select>
          </div>
          <span className="font-mono-code text-xs text-zinc-600">
            Asientos configurados: <strong>{filteredCabina.length}</strong>
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Asiento Físico</th>
              <th className="py-2.5 px-4 font-semibold">Ubicación</th>
              <th className="py-2.5 px-4 font-semibold">Clase Comercial</th>
              <th className="py-2.5 px-4 font-semibold">Ocupación</th>
              <th className="py-2.5 px-4 font-semibold">Estado Concurrencia</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones Operativas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {filteredCabina.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Cargando información...'
                    : 'No hay asientos habilitados para este vuelo. Use "+ Habilitar Asiento en Vuelo".'}
                </td>
              </tr>
            ) : (
              filteredCabina.map((item) => {
                const asFis = asientos.find((a) => a.id === item.asientoId);
                const cl = asFis ? clases.find((c) => c.id === asFis.claseAsientoId) : null;
                const designador = asFis ? `${asFis.fila}${asFis.letra}` : `#${item.asientoId}`;
                const ubic = asFis ? getUbicacionPorLetra(asFis.letra) : '—';
                return (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono-code text-zinc-500">#{item.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code font-bold px-2.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                        {designador}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-700">{ubic}</td>
                    <td className="py-3 px-4 font-semibold text-[#18181B]">
                      {cl ? cl.nombre : 'Estándar'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                          item.estaOcupado
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}
                      >
                        {item.estaOcupado ? 'Ocupado' : 'Libre'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-700">
                      {item.estadoConcurrencia}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {item.estaOcupado || item.estadoConcurrencia.toUpperCase() === 'BLOQUEADO' ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleBloqueoOLiberar(item, false, 'Disponible')
                          }
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold cursor-pointer"
                        >
                          Liberar Asiento
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleBloqueoOLiberar(item, true, 'Bloqueado')
                          }
                          className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold cursor-pointer"
                        >
                          Bloquear
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

      {/* Modal de Habilitar Asientos en Vuelo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">
                Habilitar Asientos en Vuelo ({currentVuelo?.numeroVuelo})
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Asiento Físico de la Aeronave (AvionId #{currentVuelo?.avionId})
                </label>
                <select
                  required
                  value={modalAsientoId}
                  onChange={(e) => setModalAsientoId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {asientosDelAvion.length === 0 && (
                    <option value={0}>No hay asientos físicos registrados en este avión</option>
                  )}
                  {asientosDelAvion.map((a) => (
                    <option key={a.id} value={a.id}>
                      Butaca {a.fila}
                      {a.letra} ({getUbicacionPorLetra(a.letra)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Estado Inicial de Concurrencia
                </label>
                <select
                  value={modalEstadoConcurrencia}
                  onChange={(e) => setModalEstadoConcurrencia(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  <option value="Disponible">Disponible (Libre para venta Counter)</option>
                  <option value="Bloqueado">Bloqueado (Reserva operativa)</option>
                </select>
              </div>

              {/* Botón Inteligente: Habilitar toda la cabina del avión en 1 clic */}
              <div className="pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  disabled={processingBatch || asientosDelAvion.length === 0}
                  onClick={handleHabilitarTodaLaCabina}
                  className="w-full h-9 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[17px]">bolt</span>
                  <span>
                    {processingBatch
                      ? 'Habilitando cabina...'
                      : `Habilitar toda la cabina automáticamente (${asientosDelAvion.length} asientos)`}
                  </span>
                </button>
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
                  disabled={!modalAsientoId}
                  className="h-9 px-4 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Habilitar Asiento Individual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
