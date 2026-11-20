import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../api/axiosClient';
import {
  AeropuertoDto,
  AsientoDto,
  AsientoVueloDto,
  ClaseAsientoDto,
  DetalleReservaDto,
  PasajeroDto,
  PuertaEmbarqueDto,
  ReservaDto,
  RutaDto,
  TerminalDto,
  TipoDocumentoDto,
  VueloDto
} from '../../types/models';

export default function HistorialTicketsCounterPage() {
  const [reservas, setReservas] = useState<ReservaDto[]>([]);
  const [detalles, setDetalles] = useState<DetalleReservaDto[]>([]);
  const [pasajeros, setPasajeros] = useState<PasajeroDto[]>([]);
  const [tiposDoc, setTiposDoc] = useState<TipoDocumentoDto[]>([]);
  const [vuelos, setVuelos] = useState<VueloDto[]>([]);
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [puertas, setPuertas] = useState<PuertaEmbarqueDto[]>([]);
  const [terminales, setTerminales] = useState<TerminalDto[]>([]);
  const [asientosVuelo, setAsientosVuelo] = useState<AsientoVueloDto[]>([]);
  const [asientos, setAsientos] = useState<AsientoDto[]>([]);
  const [clases, setClases] = useState<ClaseAsientoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('ALL');

  // Modal 8: Boarding Pass Digital
  const [selectedBoardingReserva, setSelectedBoardingReserva] = useState<ReservaDto | null>(
    null
  );

  // Modal 9: Cancelación SoftDelete + Liberación de Asiento
  const [selectedCancelReserva, setSelectedCancelReserva] = useState<ReservaDto | null>(null);
  const [canceling, setCanceling] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [
        resRes,
        detRes,
        pasRes,
        tdRes,
        vueRes,
        rutRes,
        aerRes,
        pueRes,
        terRes,
        avuRes,
        asiRes,
        claRes
      ] = await Promise.all([
        axiosClient.get<ReservaDto[]>('/reservas'),
        axiosClient.get<DetalleReservaDto[]>('/detallesreserva'),
        axiosClient.get<PasajeroDto[]>('/pasajeros'),
        axiosClient.get<TipoDocumentoDto[]>('/tiposdocumento'),
        axiosClient.get<VueloDto[]>('/vuelos'),
        axiosClient.get<RutaDto[]>('/rutas'),
        axiosClient.get<AeropuertoDto[]>('/aeropuertos'),
        axiosClient.get<PuertaEmbarqueDto[]>('/puertasembarque'),
        axiosClient.get<TerminalDto[]>('/terminales'),
        axiosClient.get<AsientoVueloDto[]>('/asientosvuelo'),
        axiosClient.get<AsientoDto[]>('/asientos'),
        axiosClient.get<ClaseAsientoDto[]>('/clasesasiento')
      ]);
      setReservas(resRes.data);
      setDetalles(detRes.data);
      setPasajeros(pasRes.data);
      setTiposDoc(tdRes.data);
      setVuelos(vueRes.data);
      setRutas(rutRes.data);
      setAeropuertos(aerRes.data);
      setPuertas(pueRes.data);
      setTerminales(terRes.data);
      setAsientosVuelo(avuRes.data);
      setAsientos(asiRes.data);
      setClases(claRes.data);
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'No se pudo cargar la información del servidor.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getReservaRichInfo = (reserva: ReservaDto) => {
    const det = detalles.find((d) => d.reservaId === reserva.id);
    const pas = det ? pasajeros.find((p) => p.id === det.pasajeroId) : null;
    const td = pas ? tiposDoc.find((t) => t.id === pas.tipoDocumentoId) : null;
    const vuelo = vuelos.find((v) => v.id === reserva.vueloId);
    const ruta = vuelo ? rutas.find((r) => r.id === vuelo.rutaId) : null;
    const orig = ruta ? aeropuertos.find((a) => a.id === ruta.aeropuertoOrigenId) : null;
    const dest = ruta ? aeropuertos.find((a) => a.id === ruta.aeropuertoDestinoId) : null;
    const gate = vuelo ? puertas.find((p) => p.id === vuelo.puertaEmbarqueId) : null;
    const term = gate ? terminales.find((t) => t.id === gate.terminalId) : null;
    const avu = det ? asientosVuelo.find((x) => x.id === det.asientoVueloId) : null;
    const asFis = avu ? asientos.find((a) => a.id === avu.asientoId) : null;
    const clase = asFis ? clases.find((c) => c.id === asFis.claseAsientoId) : null;

    return {
      det,
      pas,
      td,
      vuelo,
      ruta,
      orig,
      dest,
      gate,
      term,
      avu,
      asFis,
      clase,
      pasajeroNombre: pas ? `${pas.nombres} ${pas.apellidos}` : 'Pasajero Titular',
      pasajeroDoc: pas
        ? `${td ? td.codigo : 'DOC'} ${pas.numeroDocumento}`
        : 'Sin documento',
      vueloRutaStr: vuelo
        ? `${vuelo.numeroVuelo} (${orig ? orig.codigoIata : 'ORI'} → ${
            dest ? dest.codigoIata : 'DES'
          })`
        : `Vuelo #${reserva.vueloId}`,
      asientoStr: asFis
        ? `${asFis.fila}${asFis.letra} · ${clase ? clase.nombre : 'Estándar'}`
        : avu
        ? `Asiento #${avu.asientoId}`
        : '—'
    };
  };

  const handleExportExcel = async () => {
    setErrorMsg(null);
    try {
      const res = await axiosClient.get('/reportes/reservas-excel', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Reservas_${new Date().toISOString().slice(0, 10)}.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMsg(extractApiError(err, 'Error al exportar reporte de reservas (.xls).'));
    }
  };

  const handleConfirmCancelSoftDelete = async () => {
    if (!selectedCancelReserva) return;
    setCanceling(true);
    setErrorMsg(null);
    try {
      const info = getReservaRichInfo(selectedCancelReserva);

      // 1. Anular Reserva con SoftDelete (EstadoReserva = "Cancelada", Activo = false)
      await axiosClient.put(`/reservas/${selectedCancelReserva.id}`, {
        id: selectedCancelReserva.id,
        codigoTicket: selectedCancelReserva.codigoTicket,
        vueloId: selectedCancelReserva.vueloId,
        usuarioRegistroId: selectedCancelReserva.usuarioRegistroId,
        montoTotal: selectedCancelReserva.montoTotal,
        estadoReserva: 'Cancelada',
        activo: false
      });

      // 2. Desactivar DetalleReserva si existe
      if (info.det) {
        await axiosClient.put(`/detallesreserva/${info.det.id}`, {
          id: info.det.id,
          reservaId: info.det.reservaId,
          pasajeroId: info.det.pasajeroId,
          asientoVueloId: info.det.asientoVueloId,
          precioUnitario: info.det.precioUnitario,
          activo: false
        });
      }

      // 3. Liberar instantáneamente el AsientoVuelo (EstaOcupado = false, EstadoConcurrencia = "Disponible")
      if (info.avu) {
        await axiosClient.put(`/asientosvuelo/${info.avu.id}`, {
          id: info.avu.id,
          vueloId: info.avu.vueloId,
          asientoId: info.avu.asientoId,
          estaOcupado: false,
          estadoConcurrencia: 'Disponible',
          activo: true
        });
      }

      setSelectedCancelReserva(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(
        extractApiError(err, 'Error al ejecutar la anulación lógica (SoftDelete) y liberación de asiento.')
      );
    } finally {
      setCanceling(false);
    }
  };

  const reservasConfirmadas = reservas.filter(
    (r) => r.activo && r.estadoReserva.toUpperCase() !== 'CANCELADA'
  );
  const recaudacionTotalUsd = reservasConfirmadas.reduce((acc, r) => acc + r.montoTotal, 0);

  const filtered = reservas.filter((r) => {
    const isCanceled = !r.activo || r.estadoReserva.toUpperCase() === 'CANCELADA';
    if (estadoFilter === 'CONFIRMADA' && isCanceled) return false;
    if (estadoFilter === 'CANCELADA' && !isCanceled) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const info = getReservaRichInfo(r);
      return (
        r.codigoTicket.toLowerCase().includes(q) ||
        info.pasajeroNombre.toLowerCase().includes(q) ||
        info.pasajeroDoc.toLowerCase().includes(q) ||
        info.vueloRutaStr.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Terminal de Mostrador Counter / 4. Emisión &amp; Pase de Abordaje
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">
            Historial de Reservas y Emisión de Tickets
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Consulta de boletos emitidos, generación de Boarding Pass digital y cancelación lógica
            (SoftDelete) con liberación automática de butaca.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-zinc-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-zinc-500 block">
              Facturación Confirmada
            </span>
            <span className="font-mono-code text-base font-bold text-emerald-700">
              ${recaudacionTotalUsd.toFixed(2)} USD ({reservasConfirmadas.length} tickets)
            </span>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            <span>Exportar Reporte (.xls)</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Barra de Búsqueda + Filtros por Estado */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Código Ticket (TCK-...), DNI o Vuelo..."
            className="w-80 h-9 px-3 rounded border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
          />

          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: `Todas (${reservas.length})` },
              { id: 'CONFIRMADA', label: 'Confirmadas' },
              { id: 'CANCELADA', label: 'Canceladas (SoftDelete)' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setEstadoFilter(st.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                  estadoFilter === st.id
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Reservas (Reserva + DetalleReserva) */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Código Ticket</th>
              <th className="py-2.5 px-4 font-semibold">Pasajero Titular</th>
              <th className="py-2.5 px-4 font-semibold">Vuelo &amp; Ruta</th>
              <th className="py-2.5 px-4 font-semibold">Asiento</th>
              <th className="py-2.5 px-4 font-semibold">Fecha Reserva</th>
              <th className="py-2.5 px-4 font-semibold">Monto Total</th>
              <th className="py-2.5 px-4 font-semibold">Estado</th>
              <th className="py-2.5 px-4 font-semibold text-right">Acciones Counter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-zinc-500">
                  {loading
                    ? 'Cargando información...'
                    : 'No hay tickets emitidos.'}
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const info = getReservaRichInfo(r);
                const isCanceled =
                  !r.activo || r.estadoReserva.toUpperCase() === 'CANCELADA';

                return (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono-code text-zinc-500">#{r.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono-code font-bold px-2.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                        {r.codigoTicket}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#18181B]">{info.pasajeroNombre}</div>
                      <div className="font-mono-code text-[11px] text-zinc-500">
                        {info.pasajeroDoc}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono-code font-semibold text-zinc-800">
                      {info.vueloRutaStr}
                    </td>
                    <td className="py-3 px-4 font-mono-code font-bold text-[#0284C7]">
                      {info.asientoStr}
                    </td>
                    <td className="py-3 px-4 font-mono-code text-zinc-600">
                      {new Date(r.fechaReserva).toLocaleString('es-PE', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono-code font-bold text-emerald-700">
                      ${r.montoTotal.toFixed(2)} USD
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${
                          isCanceled
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}
                      >
                        {isCanceled ? 'Cancelada' : r.estadoReserva}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedBoardingReserva(r)}
                        className="px-2.5 py-1 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold cursor-pointer"
                      >
                        Ver Boarding Pass
                      </button>
                      {!isCanceled && (
                        <button
                          type="button"
                          onClick={() => setSelectedCancelReserva(r)}
                          className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold cursor-pointer"
                        >
                          Cancelar
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

      {/* MODAL 8: Pase de Abordaje Digital — Boarding Pass (Sin franquicia de equipaje ni frequent flyer) */}
      {selectedBoardingReserva &&
        (() => {
          const info = getReservaRichInfo(selectedBoardingReserva);
          const seatCode = info.asFis
            ? `${info.asFis.fila}${info.asFis.letra}`
            : 'ASIGNADO';
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-xs p-4">
              <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 bg-[#0284C7] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-2xl">
                      airplane_ticket
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-85 block">
                        AeroManager Boarding Pass Oficial
                      </span>
                      <h3 className="text-base font-bold">
                        Pase de Abordaje Digital — Ticket #{selectedBoardingReserva.codigoTicket}
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/20 font-mono-code text-xs font-bold">
                    {selectedBoardingReserva.estadoReserva.toUpperCase()}
                  </span>
                </div>

                {/* Boleto Aéreo dividido en 2 cuerpos (Principal + Talón Derecho) */}
                <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-dashed divide-zinc-300">
                  {/* Cuerpo Principal (8 cols) */}
                  <div className="md:col-span-8 p-6 space-y-5">
                    {/* Trayecto IATA Origen ✈️ Destino */}
                    <div className="flex items-center justify-between bg-[#F4F4F5] p-4 rounded-xl border border-zinc-200">
                      <div>
                        <span className="font-mono-code text-3xl font-bold text-[#18181B]">
                          {info.orig ? info.orig.codigoIata : 'LIM'}
                        </span>
                        <span className="block text-xs text-zinc-500">
                          {info.orig ? info.orig.nombre : 'Aeropuerto Origen'}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-[#0284C7] text-2xl">
                        flight_takeoff
                      </span>
                      <div className="text-right">
                        <span className="font-mono-code text-3xl font-bold text-[#18181B]">
                          {info.dest ? info.dest.codigoIata : 'CUZ'}
                        </span>
                        <span className="block text-xs text-zinc-500">
                          {info.dest ? info.dest.nombre : 'Aeropuerto Destino'}
                        </span>
                      </div>
                    </div>

                    {/* Datos del Pasajero y Vuelo */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                          Pasajero Titular
                        </span>
                        <span className="text-sm font-bold text-[#18181B]">
                          {info.pasajeroNombre}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                          Documento de Identidad
                        </span>
                        <span className="font-mono-code text-sm font-bold text-[#18181B]">
                          {info.pasajeroDoc}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                          Vuelo / Terminal / Gate
                        </span>
                        <span className="font-mono-code text-sm font-bold text-[#0284C7]">
                          {info.vuelo ? info.vuelo.numeroVuelo : 'VUELO'} •{' '}
                          {info.term ? info.term.codigo : 'T1'} • Gate{' '}
                          {info.gate ? info.gate.codigoGate : 'A01'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                          Fecha y Hora de Salida
                        </span>
                        <span className="font-mono-code text-sm font-semibold text-zinc-800">
                          {info.vuelo
                            ? new Date(info.vuelo.fechaHoraSalida).toLocaleString('es-PE', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })
                            : 'Programado'}
                        </span>
                      </div>
                    </div>

                    {/* Código de Barras Visual */}
                    <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                      <div className="font-mono-code text-xs tracking-[0.25em] text-zinc-400 select-none">
                        ||| |||| || ||||| ||| |||| ||||| ||| ||||
                      </div>
                      <span className="font-mono-code text-xs font-bold text-zinc-600">
                        {selectedBoardingReserva.codigoTicket}
                      </span>
                    </div>
                  </div>

                  {/* Talón Derecho del Pasajero (4 cols) */}
                  <div className="md:col-span-4 p-6 bg-[#F4F4F5] flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                        Talón de Embarque
                      </span>
                      <div className="p-3 rounded-xl bg-white border border-zinc-200 text-center">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                          Asiento Asignado
                        </span>
                        <span className="font-mono-code text-3xl font-bold text-[#0284C7]">
                          {seatCode}
                        </span>
                        <span className="block text-xs font-semibold text-zinc-600 mt-0.5">
                          {info.clase ? info.clase.nombre : 'Clase Estándar'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Puerta:</span>
                          <strong className="font-mono-code">
                            GATE {info.gate ? info.gate.codigoGate : 'A01'}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Tarifa:</span>
                          <strong className="font-mono-code text-emerald-700">
                            ${selectedBoardingReserva.montoTotal.toFixed(2)} USD
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full h-9 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                        <span>Imprimir Pase</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBoardingReserva(null)}
                        className="w-full h-8 rounded bg-white border border-zinc-300 text-zinc-700 text-xs font-semibold cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* MODAL 9: Cancelación de Reserva y Liberación de Asiento — SoftDelete */}
      {selectedCancelReserva &&
        (() => {
          const info = getReservaRichInfo(selectedCancelReserva);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden">
                <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#18181B]">
                    Anulación Lógica de Reserva y Liberación de Asiento (SoftDelete)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedCancelReserva(null)}
                    className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  {/* Ficha Resumen de la Reserva a Anular */}
                  <div className="p-4 rounded-xl bg-[#F4F4F5] border border-zinc-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Código Ticket / ID Reserva:</span>
                      <span className="font-mono-code font-bold text-[#18181B]">
                        {selectedCancelReserva.codigoTicket} (#{selectedCancelReserva.id})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Pasajero Titular:</span>
                      <span className="font-semibold text-[#18181B]">
                        {info.pasajeroNombre} ({info.pasajeroDoc})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Vuelo &amp; Ruta:</span>
                      <span className="font-mono-code font-semibold text-zinc-800">
                        {info.vueloRutaStr}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Asiento a Liberar en Cabina:</span>
                      <span className="font-mono-code font-bold text-[#0284C7]">
                        {info.asientoStr}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Monto Registrado:</span>
                      <span className="font-mono-code font-bold text-emerald-700">
                        ${selectedCancelReserva.montoTotal.toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  {/* Recuadro Ámbar de Regla de Negocio SoftDelete */}
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                    <strong>Aviso de Auditoría y Regla de Negocio (SoftDelete):</strong> La reserva
                    pasará a estado <strong>«Cancelada» (`Activo = false`)</strong> mediante borrado
                    lógico para preservar la trazabilidad histórica. El
                    asiento en el vuelo se actualizará
                    instantáneamente a <strong>Libre (`Disponible`)</strong> para
                    que otro pasajero pueda reservarlo.
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setSelectedCancelReserva(null)}
                      className="h-9 px-4 rounded bg-[#F4F4F5] text-zinc-700 text-xs font-semibold cursor-pointer"
                    >
                      Volver sin cambios
                    </button>
                    <button
                      type="button"
                      disabled={canceling}
                      onClick={handleConfirmCancelSoftDelete}
                      className="h-9 px-5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {canceling ? 'Liberando asiento...' : 'Confirmar y Liberar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
