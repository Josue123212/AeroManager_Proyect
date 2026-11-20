// ============================================================================
// AeroManager — 20 Entidades DTOs + Auth + Reportes + Copilot IA (Propuesta 3)
// ============================================================================

export interface PaisDto {
  id: number;
  nombre: string;
  codigoIso: string;
  activo: boolean;
}

export interface CiudadDto {
  id: number;
  nombre: string;
  paisId: number;
  activo: boolean;
}

export interface TipoDocumentoDto {
  id: number;
  codigo: string;
  nombre: string;
  longitudMaxima: number;
  activo: boolean;
}

export interface RolDto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface UsuarioDto {
  id: number;
  nombreCompleto: string;
  email: string;
  fechaCreacion: string;
  activo: boolean;
}

export interface UsuarioRolDto {
  id: number;
  usuarioId: number;
  rolId: number;
  fechaAsignacion: string;
  activo: boolean;
}

export interface AeropuertoDto {
  id: number;
  nombre: string;
  codigoIata: string;
  ciudadId: number;
  direccion?: string;
  activo: boolean;
}

export interface TerminalDto {
  id: number;
  codigo: string;
  nombre: string;
  aeropuertoId: number;
  activo: boolean;
}

export interface PuertaEmbarqueDto {
  id: number;
  codigoGate: string;
  estado: string; // 'Disponible' | 'Ocupada' | 'Mantenimiento'
  terminalId: number;
  activo: boolean;
}

export interface AerolineaDto {
  id: number;
  nombre: string;
  codigoIata: string;
  paisOrigenId: number;
  activo: boolean;
}

export interface ModeloAvionDto {
  id: number;
  nombreModelo: string;
  fabricante: string;
  capacidadTotal: number;
  alcanceKm: number;
  activo: boolean;
}

export interface AvionDto {
  id: number;
  matricula: string;
  estadoOperativo: string; // 'Operativo' | 'EnMantenimiento' | 'EnVuelo'
  aerolineaId: number;
  modeloAvionId: number;
  activo: boolean;
}

export interface ClaseAsientoDto {
  id: number;
  nombre: string; // 'Ejecutiva' | 'Economica' | 'PrimeraClase'
  multiplicadorTarifa: number;
  activo: boolean;
}

export interface AsientoDto {
  id: number;
  codigoAsiento: string; // '1A', '12C', etc.
  fila: number;
  columna: string;
  avionId: number;
  claseAsientoId: number;
  activo: boolean;
}

export interface RutaDto {
  id: number;
  codigoRuta: string;
  aeropuertoOrigenId: number;
  aeropuertoDestinoId: number;
  distanciaKm: number;
  duracionEstimadaMinutos: number;
  activo: boolean;
}

export interface VueloDto {
  id: number;
  numeroVuelo: string;
  rutaId: number;
  avionId: number;
  puertaEmbarqueId: number;
  fechaHoraSalida: string;
  fechaHoraLlegada: string;
  capacidadVuelo: number;
  precioBase: number;
  estado: string; // 'Programado' | 'Abordando' | 'EnVuelo' | 'Aterrizado' | 'Demorado' | 'Cancelado'
  activo: boolean;
}

export interface AsientoVueloDto {
  id: number;
  vueloId: number;
  asientoId: number;
  estaOcupado: boolean;
  estadoConcurrencia: string; // 'Disponible' | 'Reservado' | 'Emitido'
  fechaActualizacion: string;
  activo: boolean;
}

export interface PasajeroDto {
  id: number;
  nombres: string;
  apellidos: string;
  tipoDocumentoId: number;
  numeroDocumento: string;
  email: string;
  telefono: string;
  nacionalidadPaisId: number;
  activo: boolean;
}

export interface ReservaDto {
  id: number;
  codigoTicket: string;
  vueloId: number;
  usuarioRegistroId: number;
  fechaReserva: string;
  montoTotal: number;
  estadoReserva: string; // 'Confirmada' | 'CheckIn' | 'Cancelada'
  activo: boolean;
}

export interface DetalleReservaDto {
  id: number;
  reservaId: number;
  pasajeroId: number;
  asientoVueloId: number;
  precioUnitario: number;
  fechaRegistro: string;
  activo: boolean;
}

// Auth & Copilot IA DTOs
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  roles: string[];
}

export interface AiAssistantRequestDto {
  pregunta: string;
}

export interface AiAssistantResponseDto {
  pregunta: string;
  respuesta: string;
  contextoAnalizado: string;
  fechaConsulta: string;
}

export type RolActivoType = 'Administrador' | 'Operador' | 'Counter';
