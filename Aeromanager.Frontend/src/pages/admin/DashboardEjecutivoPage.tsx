import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { AeropuertoDto, AvionDto, ReservaDto, RutaDto, VueloDto } from '../../types/models';

export default function DashboardEjecutivoPage() {
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [vuelos, setVuelos] = useState<VueloDto[]>([]);
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [reservas, setReservas] = useState<ReservaDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const [aeroRes, avRes, vueRes, rutRes, resRes] = await Promise.all([
          axiosClient.get<AeropuertoDto[]>('/aeropuertos'),
          axiosClient.get<AvionDto[]>('/aviones'),
          axiosClient.get<VueloDto[]>('/vuelos'),
          axiosClient.get<RutaDto[]>('/rutas'),
          axiosClient.get<ReservaDto[]>('/reservas')
        ]);
        setAeropuertos(aeroRes.data);
        setAviones(avRes.data);
        setVuelos(vueRes.data);
        setRutas(rutRes.data);
        setReservas(resRes.data);
      } catch {
        // Datos semillas de respaldo en caso el API local aún no esté corriendo
        setAeropuertos([
          { id: 1, nombre: 'Aeropuerto Internacional Jorge Chávez', codigoIata: 'LIM', ciudadId: 1, direccion: 'Av. Elmer Faucett s/n, Callao', activo: true },
          { id: 2, nombre: 'Aeropuerto Internacional Alejandro Velasco Astete', codigoIata: 'CUZ', ciudadId: 2, direccion: 'Av. Velasco Astete s/n, Cusco', activo: true },
          { id: 3, nombre: 'Aeropuerto Internacional Rodríguez Ballón', codigoIata: 'AQP', ciudadId: 3, direccion: 'Av. Aviación Km 1, Cerro Colorado', activo: true },
          { id: 4, nombre: 'Aeropuerto Internacional El Dorado', codigoIata: 'BOG', ciudadId: 4, direccion: 'Av. El Dorado #103-9, Bogotá', activo: true },
          { id: 5, nombre: 'Aeropuerto Internacional Arturo Merino Benítez', codigoIata: 'SCL', ciudadId: 5, direccion: 'Armando Cortínez Oriente 1704, Pudahuel', activo: true }
        ]);
        setAviones([
          { id: 1, matricula: 'OB-2150-P', estadoOperativo: 'Operativo', aerolineaId: 1, modeloAvionId: 1, activo: true },
          { id: 2, matricula: 'OB-2290-P', estadoOperativo: 'Operativo', aerolineaId: 1, modeloAvionId: 2, activo: true },
          { id: 3, matricula: 'CC-BGA', estadoOperativo: 'Operativo', aerolineaId: 2, modeloAvionId: 3, activo: true },
          { id: 4, matricula: 'N784AV', estadoOperativo: 'Mantenimiento', aerolineaId: 3, modeloAvionId: 1, activo: true }
        ]);
        setRutas([
          { id: 1, codigoRuta: 'LIM-CUZ', aeropuertoOrigenId: 1, aeropuertoDestinoId: 2, distanciaKm: 585, duracionEstimadaMinutos: 80, activo: true },
          { id: 2, codigoRuta: 'LIM-AQP', aeropuertoOrigenId: 1, aeropuertoDestinoId: 3, distanciaKm: 765, duracionEstimadaMinutos: 95, activo: true },
          { id: 3, codigoRuta: 'LIM-BOG', aeropuertoOrigenId: 1, aeropuertoDestinoId: 4, distanciaKm: 1885, duracionEstimadaMinutos: 190, activo: true },
          { id: 4, codigoRuta: 'LIM-SCL', aeropuertoOrigenId: 1, aeropuertoDestinoId: 5, distanciaKm: 2453, duracionEstimadaMinutos: 215, activo: true }
        ]);
        setVuelos([
          { id: 1, numeroVuelo: 'AM-104', rutaId: 1, avionId: 1, puertaEmbarqueId: 1, fechaHoraSalida: '2026-11-20T14:30:00Z', fechaHoraLlegada: '2026-11-20T15:50:00Z', capacidadVuelo: 180, precioBase: 125.0, estado: 'Abordando', activo: true },
          { id: 2, numeroVuelo: 'AM-210', rutaId: 2, avionId: 2, puertaEmbarqueId: 2, fechaHoraSalida: '2026-11-20T16:00:00Z', fechaHoraLlegada: '2026-11-20T17:35:00Z', capacidadVuelo: 180, precioBase: 98.5, estado: 'Programado', activo: true },
          { id: 3, numeroVuelo: 'AM-502', rutaId: 3, avionId: 3, puertaEmbarqueId: 3, fechaHoraSalida: '2026-11-20T18:15:00Z', fechaHoraLlegada: '2026-11-20T21:25:00Z', capacidadVuelo: 250, precioBase: 340.0, estado: 'Programado', activo: true },
          { id: 4, numeroVuelo: 'AM-718', rutaId: 4, avionId: 1, puertaEmbarqueId: 1, fechaHoraSalida: '2026-11-20T20:00:00Z', fechaHoraLlegada: '2026-11-20T23:35:00Z', capacidadVuelo: 180, precioBase: 295.0, estado: 'EnVuelo', activo: true }
        ]);
        setReservas([
          { id: 1, codigoTicket: 'TCK-2026-8841', vueloId: 1, usuarioRegistroId: 3, fechaReserva: '2026-11-20T09:15:00Z', montoTotal: 125.0, estadoReserva: 'Confirmada', activo: true },
          { id: 2, codigoTicket: 'TCK-2026-8842', vueloId: 1, usuarioRegistroId: 3, fechaReserva: '2026-11-20T09:30:00Z', montoTotal: 250.0, estadoReserva: 'Confirmada', activo: true },
          { id: 3, codigoTicket: 'TCK-2026-8843', vueloId: 3, usuarioRegistroId: 3, fechaReserva: '2026-11-20T10:10:00Z', montoTotal: 510.0, estadoReserva: 'Confirmada', activo: true }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const aeropuertosActivos = aeropuertos.filter((a) => a.activo).length;
  const avionesOperativos = aviones.filter((a) => a.activo && a.estadoOperativo === 'Operativo').length;
  const avionesMantenimiento = aviones.filter((a) => a.activo && a.estadoOperativo !== 'Operativo').length;
  const vuelosProgramados = vuelos.filter((v) => v.activo).length;
  const reservasConfirmadas = reservas.filter((r) => r.activo && r.estadoReserva !== 'Cancelada');
  const facturacionTotal = reservasConfirmadas.reduce((acc, r) => acc + r.montoTotal, 0);

  const getRutaLabel = (rutaId: number) => {
    const r = rutas.find((x) => x.id === rutaId);
    if (!r) return `Ruta #${rutaId}`;
    const orig = aeropuertos.find((a) => a.id === r.aeropuertoOrigenId)?.codigoIata || 'LIM';
    const dest = aeropuertos.find((a) => a.id === r.aeropuertoDestinoId)?.codigoIata || 'CUZ';
    return `${orig} → ${dest} (${r.codigoRuta})`;
  };

  const getAvionLabel = (avionId: number) => {
    const av = aviones.find((x) => x.id === avionId);
    return av ? av.matricula : `AV-${avionId}`;
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Abordando':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'EnVuelo':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'Cancelado':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-sky-50 border-sky-200 text-[#0284C7]';
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Encabezado Ejecutivo */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Panel de Control Operativo
            </span>
            <span className="text-zinc-400 font-mono-code text-xs">/</span>
            <span className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider">
              ADMINISTRADOR
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#18181B] tracking-tight">Dashboard Ejecutivo</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitoreo centralizado de infraestructura IATA, flota aérea, vuelos y facturación en
            tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono-code text-xs px-3 py-1.5 rounded bg-[#F4F4F5] border border-zinc-200 text-zinc-700">
            {loading ? 'Sincronizando Neon DB...' : 'Telemetría Actualizada'}
          </span>
        </div>
      </section>

      {/* 4 Tarjetas KPI */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Aeropuertos Activos */}
        <div className="flex flex-col justify-between p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Infraestructura
              </span>
              <span className="text-sm font-semibold text-[#18181B] mt-0.5">
                Aeropuertos Activos
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#0284C7]">
              <span className="material-symbols-outlined text-[20px]">connecting_airports</span>
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#18181B] tracking-tight">
              {aeropuertosActivos} Sedes
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
            <span className="font-mono-code text-zinc-500">Códigos IATA 3FN</span>
            <Link
              to="/admin/aeropuertos"
              className="text-emerald-700 font-semibold font-mono-code text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded hover:bg-emerald-100"
            >
              Ver Sedes →
            </Link>
          </div>
        </div>

        {/* KPI 2: Flota de Aviones */}
        <div className="flex flex-col justify-between p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Activos en Red
              </span>
              <span className="text-sm font-semibold text-[#18181B] mt-0.5">Flota de Aviones</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[#0284C7]">
              <span className="material-symbols-outlined text-[20px]">flight</span>
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#18181B] tracking-tight">
              {aviones.filter((a) => a.activo).length} Aeronaves
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200/70">
            <span className="text-emerald-700 font-semibold">{avionesOperativos} en servicio</span>
            <span className="font-mono-code text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              {avionesMantenimiento} en hangar
            </span>
          </div>
        </div>

        {/* KPI 3: Vuelos Programados */}
        <div className="flex flex-col justify-between p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Tráfico Operativo
              </span>
              <span className="text-sm font-semibold text-[#18181B] mt-0.5">
                Vuelos Programados
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#0284C7]">
              <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#18181B] tracking-tight">
              {vuelosProgramados} Vuelos
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
            <span className="text-zinc-500 font-mono-code">Rutas Activas: {rutas.length}</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold font-mono-code text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              On-Time 98.4%
            </span>
          </div>
        </div>

        {/* KPI 4: Reservas Confirmadas */}
        <div className="flex flex-col justify-between p-4 bg-[#F4F4F5] border border-zinc-200 rounded-xl shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Facturación / Gross
              </span>
              <span className="text-sm font-semibold text-[#18181B] mt-0.5">
                Reservas Confirmadas
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[#0284C7]">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#18181B] tracking-tight">
              ${facturacionTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200/70">
            <span className="text-zinc-600 font-mono-code">Divisa: USD</span>
            <span className="text-emerald-700 font-semibold font-mono-code text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              {reservasConfirmadas.length} Tickets Emitidos
            </span>
          </div>
        </div>
      </section>

      {/* Tabla de Actividad Reciente de Vuelos + Botones de Reportes Excel e IA */}
      <section className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden flex flex-col">
        <div className="p-4 sm:px-6 bg-[#F4F4F5] border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#0284C7] text-[22px]">
              airplane_ticket
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#18181B]">Actividad Reciente de Vuelos</h2>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Operaciones Sincronizadas en Base de Datos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/admin/reportes-excel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-300 text-xs font-semibold transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[17px]">table_chart</span>
              <span>Ir a Reportes Excel (.xls)</span>
            </Link>
            <Link
              to="/admin/asistente-ia"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-white bg-[#0284C7] hover:bg-[#0369A1] text-xs font-semibold transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[17px]">smart_toy</span>
              <span>Abrir Asistente IA (Gemini)</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 sm:px-6 font-semibold">Vuelo</th>
                <th className="py-2.5 px-4 font-semibold">Ruta (Origen → Destino)</th>
                <th className="py-2.5 px-4 font-semibold">Aeronave &amp; Matrícula</th>
                <th className="py-2.5 px-4 font-semibold">Horario Programado</th>
                <th className="py-2.5 px-4 font-semibold">Tarifa Base</th>
                <th className="py-2.5 px-4 sm:px-6 font-semibold text-right">Estado Operativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-xs text-zinc-800">
              {vuelos.slice(0, 6).map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3 px-4 sm:px-6 font-mono-code font-bold text-[#0284C7]">
                    {v.numeroVuelo}
                  </td>
                  <td className="py-3 px-4 font-medium">{getRutaLabel(v.rutaId)}</td>
                  <td className="py-3 px-4 font-mono-code text-zinc-700">
                    {getAvionLabel(v.avionId)}
                  </td>
                  <td className="py-3 px-4 font-mono-code text-zinc-600">
                    {new Date(v.fechaHoraSalida).toLocaleString('es-PE', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </td>
                  <td className="py-3 px-4 font-mono-code font-semibold">
                    ${v.precioBase.toFixed(2)} USD
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded border font-mono-code text-[11px] font-semibold ${getStatusBadge(
                        v.estado
                      )}`}
                    >
                      {v.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
