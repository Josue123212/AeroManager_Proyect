import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  AeropuertoDto,
  AsientoDto,
  AsientoVueloDto,
  AvionDto,
  ClaseAsientoDto,
  PasajeroDto,
  PuertaEmbarqueDto,
  ReservaDto,
  RutaDto,
  UsuarioDto,
  VueloDto
} from '../../types/models';

export default function MapaCabinaReservaPage() {
  const navigate = useNavigate();
  const [vuelos, setVuelos] = useState<VueloDto[]>([]);
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [aeropuertos, setAeropuertos] = useState<AeropuertoDto[]>([]);
  const [aviones, setAviones] = useState<AvionDto[]>([]);
  const [puertas, setPuertas] = useState<PuertaEmbarqueDto[]>([]);
  const [asientos, setAsientos] = useState<AsientoDto[]>([]);
  const [clases, setClases] = useState<ClaseAsientoDto[]>([]);
  const [asientosVuelo, setAsientosVuelo] = useState<AsientoVueloDto[]>([]);
  const [pasajeros, setPasajeros] = useState<PasajeroDto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);

  const [selectedVueloId, setSelectedVueloId] = useState<number>(0);
  const [selectedAsientoVueloId, setSelectedAsientoVueloId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal 5: Confirmación Transaccional de Reserva
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [codigoTicket, setCodigoTicket] = useState('');
  const [selectedPasajeroId, setSelectedPasajeroId] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Modal 6: Alerta de Conflicto de Concurrencia (HTTP 409 / Asiento Ocupado)
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictSeatLabel, setConflictSeatLabel] = useState('');
  const [conflictAlternativas, setConflictAlternativas] = useState<
    { asientoVueloId: number; label: string; clase: string }[]
  >([]);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [vRes, rRes, aeRes, avRes, puRes, asRes, clRes, avuRes, paRes, usRes] =
        await Promise.all([
          axiosClient.get<VueloDto[]>('/vuelos'),
          axiosClient.get<RutaDto[]>('/rutas'),
          axiosClient.get<AeropuertoDto[]>('/aeropuertos'),
          axiosClient.get<AvionDto[]>('/aviones'),
          axiosClient.get<PuertaEmbarqueDto[]>('/puertasembarque'),
          axiosClient.get<AsientoDto[]>('/asientos'),
          axiosClient.get<ClaseAsientoDto[]>('/clasesasiento'),
          axiosClient.get<AsientoVueloDto[]>('/asientosvuelo'),
          axiosClient.get<PasajeroDto[]>('/pasajeros'),
          axiosClient.get<UsuarioDto[]>('/usuarios')
        ]);
      setVuelos(vRes.data);
      setRutas(rRes.data);
      setAeropuertos(aeRes.data);
      setAviones(avRes.data);
      setPuertas(puRes.data);
      setAsientos(asRes.data);
      setClases(clRes.data);
      setAsientosVuelo(avuRes.data);
      setPasajeros(paRes.data);
      setUsuarios(usRes.data);

      const savedVuelo = Number(localStorage.getItem('aeromanager_counter_vuelo_id') || 0);
      const savedPasajero = Number(localStorage.getItem('aeromanager_counter_pasajero_id') || 0);

      if (savedVuelo && vRes.data.some((v) => v.id === savedVuelo)) {
        setSelectedVueloId(savedVuelo);
      } else if (selectedVueloId === 0 && vRes.data.length > 0) {
        setSelectedVueloId(vRes.data[0].id);
      }

      if (savedPasajero && paRes.data.some((p) => p.id === savedPasajero)) {
        setSelectedPasajeroId(savedPasajero);
      } else if (paRes.data.length > 0) {
        setSelectedPasajeroId(paRes.data[0].id);
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Error al cargar el Mapa Visual de Cabina desde la API.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentVuelo = vuelos.find((v) => v.id === selectedVueloId);
  const currentRuta = currentVuelo ? rutas.find((r) => r.id === currentVuelo.rutaId) : null;
  const origAero = currentRuta
    ? aeropuertos.find((a) => a.id === currentRuta.aeropuertoOrigenId)
    : null;
  const destAero = currentRuta
    ? aeropuertos.find((a) => a.id === currentRuta.aeropuertoDestinoId)
    : null;
  const currentAvion = currentVuelo ? aviones.find((a) => a.id === currentVuelo.avionId) : null;
  const currentGate = currentVuelo
    ? puertas.find((p) => p.id === currentVuelo.puertaEmbarqueId)
    : null;

  const cabinaVuelo = asientosVuelo
    .filter((av) => av.vueloId === selectedVueloId && av.activo)
    .map((av) => {
      const asFis = asientos.find((a) => a.id === av.asientoId);
      const cl = asFis ? clases.find((c) => c.id === asFis.claseAsientoId) : null;
      return {
        asientoVuelo: av,
        fila: asFis ? asFis.fila : 1,
        letra: asFis ? asFis.letra.toUpperCase() : 'A',
        designador: asFis ? `${asFis.fila}${asFis.letra.toUpperCase()}` : `#${av.asientoId}`,
        claseNombre: cl ? cl.nombre : 'Económica',
        multiplicador: cl ? cl.multiplicadorTarifa : 1.0,
        claseId: cl ? cl.id : 0
      };
    })
    .sort((a, b) => (a.fila !== b.fila ? a.fila - b.fila : a.letra.localeCompare(b.letra)));

  const filasUnicas = Array.from(new Set(cabinaVuelo.map((c) => c.fila))).sort((a, b) => a - b);

  const selectedItem = cabinaVuelo.find(
    (c) => c.asientoVuelo.id === selectedAsientoVueloId
  );

  const tarifaBase = currentVuelo ? currentVuelo.precioBase : 0;
  const multiplicador = selectedItem ? selectedItem.multiplicador : 1.0;
  const subtotalAsiento = Number((tarifaBase * multiplicador).toFixed(2));

  const libresCount = cabinaVuelo.filter((c) => !c.asientoVuelo.estaOcupado).length;
  const ocupadosCount = cabinaVuelo.filter((c) => c.asientoVuelo.estaOcupado).length;

  const generateUniqueTicketCode = () => {
    const rnd = Math.floor(1000 + Math.random() * 9000);
    return `TCK-2026-${rnd}`;
  };

  const triggerConflictAlert = (seatDesignador: string, preferredClaseId: number) => {
    setConflictSeatLabel(seatDesignador);
    const alternativas = cabinaVuelo
      .filter((c) => !c.asientoVuelo.estaOcupado && c.designador !== seatDesignador)
      .sort((a, b) =>
        a.claseId === preferredClaseId && b.claseId !== preferredClaseId ? -1 : 1
      )
      .slice(0, 3)
      .map((c) => ({
        asientoVueloId: c.asientoVuelo.id,
        label: c.designador,
        clase: c.claseNombre
      }));
    setConflictAlternativas(alternativas);
    setShowConfirmModal(false);
    setShowConflictModal(true);
  };

  const handleClickSeat = (item: (typeof cabinaVuelo)[number]) => {
    if (item.asientoVuelo.estaOcupado) {
      triggerConflictAlert(item.designador, item.claseId);
      return;
    }
    setSelectedAsientoVueloId(item.asientoVuelo.id);
  };

  const openConfirmModal = () => {
    if (!selectedItem) return;
    setCodigoTicket(generateUniqueTicketCode());
    if (!selectedPasajeroId && pasajeros.length > 0) {
      setSelectedPasajeroId(pasajeros[0].id);
    }
    setCopied(false);
    setErrorMsg(null);
    setShowConfirmModal(true);
  };

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(codigoTicket);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleConfirmarReservaTransaccional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVuelo || !selectedItem || !selectedPasajeroId) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Verificar en fresco en BD si otro Counter ocupó el asiento hace milisegundos
      const freshSeatRes = await axiosClient.get<AsientoVueloDto>(
        `/asientosvuelo/${selectedItem.asientoVuelo.id}`
      );
      if (freshSeatRes.data.estaOcupado) {
        await loadData();
        triggerConflictAlert(selectedItem.designador, selectedItem.claseId);
        return;
      }

      // 2. Obtener un UsuarioRegistroId válido existente en la tabla Usuario de Neon DB
      const storedUser = localStorage.getItem('aeromanager_user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const validUsuarioId =
        usuarios.find((u) => u.id === parsedUser?.usuarioId)?.id ||
        usuarios[0]?.id ||
        1;

      // 3. Crear cabecera Reserva (POST /api/reservas)
      const reservaRes = await axiosClient.post<ReservaDto>('/reservas', {
        codigoTicket,
        vueloId: currentVuelo.id,
        usuarioRegistroId: validUsuarioId,
        montoTotal: subtotalAsiento,
        estadoReserva: 'Confirmada'
      });

      // 4. Crear DetalleReserva transaccional (ejecuta ReservaDomainService + UnitOfWork Begin/Commit)
      await axiosClient.post('/detallesreserva', {
        reservaId: reservaRes.data.id,
        pasajeroId: selectedPasajeroId,
        asientoVueloId: selectedItem.asientoVuelo.id,
        precioUnitario: subtotalAsiento
      });

      setShowConfirmModal(false);
      setSelectedAsientoVueloId(0);
      await loadData();
      navigate('/counter/tickets');
    } catch (err: any) {
      const status = err.response?.status;
      const backendMsg: string = err.response?.data?.message || '';
      if (
        status === 409 ||
        status === 400 ||
        backendMsg.toLowerCase().includes('ocupado') ||
        backendMsg.toLowerCase().includes('concurrencia')
      ) {
        await loadData();
        triggerConflictAlert(selectedItem.designador, selectedItem.claseId);
      } else {
        setErrorMsg(
          backendMsg ||
            'Error al procesar la reserva transaccional. Verifique que exista al menos un Usuario y un Pasajero en la base de datos.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Vuelo Activo + Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Terminal de Mostrador Counter / 2. Control Anti-Solapamiento
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">
            Mapa Visual de Cabina y Asignación de Asiento
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Bloqueo atómico UnitOfWork + ReservaDomainService en tiempo real sobre Neon Cloud
            PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedVueloId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedVueloId(id);
              setSelectedAsientoVueloId(0);
              localStorage.setItem('aeromanager_counter_vuelo_id', String(id));
            }}
            className="h-9 px-3 rounded border border-zinc-300 bg-white font-mono-code text-xs font-bold text-[#0284C7] outline-none focus:border-[#0284C7]"
          >
            {vuelos.length === 0 && <option value={0}>Sin vuelos en BD</option>}
            {vuelos.map((v) => (
              <option key={v.id} value={v.id}>
                Vuelo Activo: {v.numeroVuelo} (${v.precioBase.toFixed(2)} USD)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadData}
            className="h-9 px-3 rounded bg-[#F4F4F5] hover:bg-zinc-200 border border-zinc-200 font-mono-code text-xs font-semibold text-zinc-700 cursor-pointer"
          >
            ↻ Sincronizar Cabina
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Layout Principal: Columna Izquierda/Central (Fuselaje) + Columna Derecha (Detalle del Asiento) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda/Central (8 cols): Fuselaje y Grilla de Cabina */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          {/* Cinta informativa del vuelo seleccionado */}
          <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono-code text-sm font-bold px-2.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7]">
                {currentVuelo ? currentVuelo.numeroVuelo : 'SIN VUELO'}
              </span>
              <span className="text-xs font-semibold text-[#18181B]">
                {origAero ? `${origAero.nombre} (${origAero.codigoIata})` : 'Origen'} →{' '}
                {destAero ? `${destAero.nombre} (${destAero.codigoIata})` : 'Destino'}
              </span>
            </div>
            <div className="font-mono-code text-xs text-zinc-600">
              {currentAvion ? currentAvion.matricula : 'Aeronave'} •{' '}
              {currentGate ? `Gate ${currentGate.codigoGate}` : 'Gate'}
            </div>
          </div>

          {/* Leyenda de Colores de Concurrencia */}
          <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-400 inline-block"></span>
              <span className="text-zinc-700 font-medium">Disponible (Libre)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-red-100 border border-red-400 inline-block"></span>
              <span className="text-zinc-700 font-medium">Ocupado (Bloqueo Atómico)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-[#0284C7] border border-[#0284C7] inline-block"></span>
              <span className="text-zinc-700 font-medium">Seleccionado (En Foco)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-white border-2 border-amber-500 inline-block"></span>
              <span className="text-zinc-700 font-medium">Clase Ejecutiva / VIP</span>
            </div>
          </div>

          {/* Grilla Interactiva de Asientos por Fila y Letra (A B C [PASILLO] D E F) */}
          <div className="p-6 flex-1 flex flex-col items-center justify-center">
            {cabinaVuelo.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-xs text-zinc-500">
                  {loading
                    ? 'Cargando mapa de asientos desde Neon Cloud PostgreSQL...'
                    : 'Este vuelo aún no tiene asientos habilitados en la tabla AsientoVuelo.'}
                </p>
                {!loading && (
                  <button
                    type="button"
                    onClick={() => navigate('/operador/cabina')}
                    className="h-9 px-4 rounded bg-[#0284C7] text-white text-xs font-semibold cursor-pointer"
                  >
                    Ir a Consola Operador → Habilitar Cabina del Vuelo
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full max-w-md bg-[#F4F4F5] border-2 border-zinc-300 rounded-t-3xl rounded-b-xl p-5 shadow-inner">
                <div className="text-center pb-3 mb-4 border-b border-zinc-300">
                  <span className="font-mono-code text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                    ▲ CABINA DE MANDO (COCKPIT) ▲
                  </span>
                </div>

                {/* Encabezado de Columnas A B C | PASILLO | D E F */}
                <div className="grid grid-cols-7 gap-2 mb-2 text-center font-mono-code text-xs font-bold text-zinc-500">
                  <span>A</span>
                  <span>B</span>
                  <span>C</span>
                  <span className="text-[10px] text-zinc-400">PAS</span>
                  <span>D</span>
                  <span>E</span>
                  <span>F</span>
                </div>

                <div className="space-y-2.5">
                  {filasUnicas.map((numFila) => {
                    const asientosDeFila = cabinaVuelo.filter((c) => c.fila === numFila);
                    const renderSeatButton = (colLetra: string) => {
                      const found = asientosDeFila.find((x) => x.letra === colLetra);
                      if (!found) {
                        return (
                          <div
                            key={colLetra}
                            className="h-10 rounded border border-dashed border-zinc-300 bg-zinc-200/40 flex items-center justify-center font-mono-code text-[10px] text-zinc-400"
                          >
                            —
                          </div>
                        );
                      }

                      const isSelected = found.asientoVuelo.id === selectedAsientoVueloId;
                      const isOccupied = found.asientoVuelo.estaOcupado;
                      const isVip = found.multiplicador > 1.0;

                      let btnStyle =
                        'bg-emerald-50 hover:bg-emerald-100 border-emerald-400 text-emerald-800';
                      if (isOccupied) {
                        btnStyle =
                          'bg-red-100 hover:bg-red-200 border-red-400 text-red-800';
                      } else if (isSelected) {
                        btnStyle = 'bg-[#0284C7] border-[#0284C7] text-white shadow-sm';
                      }

                      return (
                        <button
                          key={colLetra}
                          type="button"
                          onClick={() => handleClickSeat(found)}
                          title={`${found.designador} (${found.claseNombre}) - ${
                            isOccupied ? 'OCUPADO' : 'DISPONIBLE'
                          }`}
                          className={`h-10 rounded border font-mono-code text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${btnStyle} ${
                            isVip && !isSelected ? 'ring-2 ring-amber-400' : ''
                          }`}
                        >
                          {found.designador}
                        </button>
                      );
                    };

                    return (
                      <div key={numFila} className="grid grid-cols-7 gap-2 items-center">
                        {renderSeatButton('A')}
                        {renderSeatButton('B')}
                        {renderSeatButton('C')}
                        <div className="text-center font-mono-code text-xs font-bold text-zinc-400">
                          {numFila}
                        </div>
                        {renderSeatButton('D')}
                        {renderSeatButton('E')}
                        {renderSeatButton('F')}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha (4 cols): Detalle del Asiento Seleccionado y Cálculo de Tarifa */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200">
              <h2 className="text-sm font-bold text-[#18181B]">
                Detalle del Asiento Seleccionado
              </h2>
              <span className="text-[11px] text-zinc-500">
                Cálculo tarifario automático (PrecioBase × Multiplicador)
              </span>
            </div>

            <div className="p-5 space-y-4">
              {selectedItem ? (
                <>
                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#0284C7] block">
                        Butaca en Foco
                      </span>
                      <span className="font-mono-code text-2xl font-bold text-[#18181B]">
                        Asiento {selectedItem.designador}
                      </span>
                      <span className="block text-xs font-semibold text-zinc-600 mt-0.5">
                        Clase: {selectedItem.claseNombre}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-100 border border-emerald-300 font-mono-code text-[11px] font-bold text-emerald-800">
                      Listo para Bloqueo
                    </span>
                  </div>

                  {/* Desglose Matemático Real del Precio */}
                  <div className="p-4 rounded-lg bg-[#F4F4F5] border border-zinc-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-600">Tarifa Base del Vuelo:</span>
                      <span className="font-mono-code font-semibold text-[#18181B]">
                        ${tarifaBase.toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-600">Multiplicador de Clase:</span>
                      <span className="font-mono-code font-semibold text-[#0284C7]">
                        {multiplicador.toFixed(2)}x
                      </span>
                    </div>
                    <div className="pt-2 border-t border-zinc-300 flex items-center justify-between text-sm">
                      <span className="font-bold text-[#18181B]">Subtotal Asiento:</span>
                      <span className="font-mono-code font-bold text-emerald-700">
                        ${subtotalAsiento.toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openConfirmModal}
                    className="w-full h-10 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Continuar a Confirmación de Reserva</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  Haga clic en un asiento verde (<strong>Disponible</strong>) en el mapa de cabina
                  para calcular su tarifa. Si hace clic en un asiento rojo (<strong>Ocupado</strong>
                  ), verá el control de conflicto de concurrencia <strong>409 Conflict</strong>.
                </div>
              )}
            </div>
          </div>

          {/* Resumen de Ocupación de Cabina */}
          <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
              Resumen de Cabina en Vivo
            </span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                  Libres
                </span>
                <span className="font-mono-code text-xl font-bold text-emerald-800">
                  {libresCount}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="text-[10px] font-bold uppercase text-red-700 block">
                  Ocupados
                </span>
                <span className="font-mono-code text-xl font-bold text-red-800">
                  {ocupadosCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 5: Confirmación Transaccional de Reserva (Sin métodos de pago) */}
      {showConfirmModal && selectedItem && currentVuelo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B]">
                Confirmación Transaccional de Reserva (UnitOfWork)
              </h3>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmarReservaTransaccional} className="p-5 space-y-4">
              {/* Resumen superior */}
              <div className="p-3.5 rounded-lg bg-[#F4F4F5] border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="font-mono-code text-xs font-bold text-[#0284C7]">
                    Vuelo {currentVuelo.numeroVuelo} • Butaca {selectedItem.designador} (
                    {selectedItem.claseNombre})
                  </span>
                  <span className="block text-[11px] text-zinc-500">
                    Tarifa Unitaria Calculada: ${tarifaBase.toFixed(2)} ×{' '}
                    {multiplicador.toFixed(2)}x
                  </span>
                </div>
                <span className="font-mono-code text-lg font-bold text-emerald-700">
                  ${subtotalAsiento.toFixed(2)} USD
                </span>
              </div>

              {/* 1. Código de Ticket */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Código de Ticket (Autogenerado con Unicidad)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={codigoTicket}
                    onChange={(e) => setCodigoTicket(e.target.value.toUpperCase())}
                    className="flex-1 h-9 px-3 rounded border border-zinc-300 font-mono-code text-xs font-bold text-[#18181B] bg-zinc-50 outline-none focus:border-[#0284C7]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyTicket}
                    className="h-9 px-3 rounded bg-[#F4F4F5] hover:bg-zinc-200 border border-zinc-300 text-xs font-semibold text-zinc-700 cursor-pointer"
                  >
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* 2. Seleccionar Pasajero Registrado */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase text-zinc-700">
                    Seleccionar Pasajero Registrado
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmModal(false);
                      navigate('/counter/pasajeros');
                    }}
                    className="text-[11px] font-semibold text-[#0284C7] hover:underline cursor-pointer"
                  >
                    + Nuevo Pasajero
                  </button>
                </div>
                <select
                  required
                  value={selectedPasajeroId}
                  onChange={(e) => setSelectedPasajeroId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-zinc-300 text-xs bg-white outline-none focus:border-[#0284C7]"
                >
                  {pasajeros.length === 0 && (
                    <option value={0}>No hay pasajeros en BD — Registre uno primero</option>
                  )}
                  {pasajeros.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos} — Doc: {p.numeroDocumento}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Monto Total USD */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Monto Total Facturado (USD)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$${subtotalAsiento.toFixed(2)} USD`}
                  className="w-full h-9 px-3 rounded border border-zinc-300 bg-zinc-100 font-mono-code text-xs font-bold text-emerald-700"
                />
              </div>

              {/* Garantía de Atomicidad ACID */}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
                <strong>GARANTÍA DE ATOMICIDAD ACID:</strong> Al confirmar, el asiento{' '}
                <strong className="font-mono-code">{selectedItem.designador}</strong> pasará
                inmediatamente a estado <strong>OCUPADO (`EstaOcupado = True`)</strong> mediante
                transacción atómica <code className="font-mono-code">UnitOfWork</code> (
                <code className="font-mono-code">BeginTransactionAsync</code> /{' '}
                <code className="font-mono-code">CommitTransactionAsync</code>).
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="h-9 px-4 rounded bg-[#F4F4F5] text-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedPasajeroId}
                  className="h-9 px-5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[17px]">verified</span>
                  <span>
                    {submitting
                      ? 'Ejecutando UnitOfWork...'
                      : 'Confirmar Reserva y Emitir Ticket'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Alerta de Conflicto de Concurrencia 409 Conflict */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border-2 border-red-300 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <span className="material-symbols-outlined">warning</span>
                <h3 className="text-sm font-bold">
                  Alerta de Concurrencia — HTTP 409 Conflict
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConflictModal(false)}
                className="text-red-400 hover:text-red-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-zinc-700 leading-relaxed">
                <strong>ReservaDomainService / Control Anti-Solapamiento:</strong> La butaca
                solicitada ya fue bloqueada o emitida por otro terminal de Counter.
              </p>

              <div className="p-3.5 rounded-lg bg-[#F4F4F5] border border-zinc-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Vuelo:</span>
                  <span className="font-mono-code font-bold text-[#18181B]">
                    {currentVuelo?.numeroVuelo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Asiento Solicitado:</span>
                  <span className="font-mono-code font-bold text-[#0284C7]">
                    Butaca {conflictSeatLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Estado en Neon DB:</span>
                  <span className="px-2 py-0.5 rounded bg-red-100 border border-red-300 font-mono-code text-[11px] font-bold text-red-700">
                    OCUPADO (EstaOcupado = True)
                  </span>
                </div>
              </div>

              {/* Alternativas Sugeridas Libres */}
              <div>
                <span className="text-[11px] font-bold uppercase text-zinc-600 block mb-2">
                  Alternativas Sugeridas Disponibles en Cabina:
                </span>
                {conflictAlternativas.length === 0 ? (
                  <p className="text-zinc-500">No quedan asientos libres en este vuelo.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {conflictAlternativas.map((alt) => (
                      <button
                        key={alt.asientoVueloId}
                        type="button"
                        onClick={() => {
                          setSelectedAsientoVueloId(alt.asientoVueloId);
                          setShowConflictModal(false);
                        }}
                        className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-center cursor-pointer transition-colors"
                      >
                        <span className="font-mono-code text-sm font-bold text-emerald-800 block">
                          {alt.label}
                        </span>
                        <span className="text-[10px] text-emerald-700">{alt.clase}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowConflictModal(false)}
                  className="h-9 px-4 rounded bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Entendido, elegir otro asiento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
