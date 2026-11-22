// ============================================================================
// AeroManager — 20 Entidades DTOs Exactas de Aeromanager.Application.DTOs
// ============================================================================

export interface PaisDto {
  id: number;
  nombre: string;
  codigoIso: string;
  fechaCreacion?: string;
  activo: boolean;
}

export interface CiudadDto {
  id: number;
  nombre: string;
  paisId: number;
  fechaCreacion?: string;
  activo: boolean;
}

export interface TipoDocumentoDto {
  id: number;
  codigo: string;
  nombre: string;
  longitudMaxima: number;
  fechaCreacion?: string;
  activo: boolean;
}

export interface RolDto {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaCreacion?: string;
  activo: boolean;
}

export interface UsuarioDto {
  id: number;
  nombreCompleto: string;
  email: string;
  estadoAcceso: string;
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
  fechaCreacion?: string;
  activo: boolean;
}

export interface TerminalDto {
  id: number;
  codigo: string;
  nombre: string;
  aeropuertoId: number;
  fechaCreacion?: string;
  activo: boolean;
}

export interface PuertaEmbarqueDto {
  id: number;
  codigoGate: string;
  estado: string;
  terminalId: number;
  fechaCreacion?: string;
  activo: boolean;
}

export interface AerolineaDto {
  id: number;
  nombre: string;
  codigoIata: string;
  paisOrigenId: number;
  fechaCreacion?: string;
  activo: boolean;
}

export interface ModeloAvionDto {
  id: number;
  fabricante: string;
  nombreModelo: string;
  capacidadTeorica: number;
  autonomiaKm: number;
  fechaCreacion?: string;
  activo: boolean;
}

export interface AvionDto {
  id: number;
  matricula: string;
  capacidadFisica: number;
  estadoOperativo: string;
  aerolineaId: number;
  modeloAvionId: number;
  fechaCreacion?: string;
  activo: boolean;
}

export interface ClaseAsientoDto {
  id: number;
  nombre: string;
  multiplicadorTarifa: number;
  fechaCreacion?: string;
  activo: boolean;
}

export interface AsientoDto {
  id: number;
  fila: number;
  letra: string;
  avionId: number;
  claseAsientoId: number;
  fechaCreacion?: string;
  activo: boolean;
}

export interface RutaDto {
  id: number;
  codigoRuta: string;
  aeropuertoOrigenId: number;
  aeropuertoDestinoId: number;
  distanciaKm: number;
  duracionEstimadaMinutos: number;
  fechaCreacion?: string;
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
  estado: string;
  fechaCreacion?: string;
  activo: boolean;
}

export interface AsientoVueloDto {
  id: number;
  vueloId: number;
  asientoId: number;
  estaOcupado: boolean;
  estadoConcurrencia: string;
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
  telefono?: string;
  nacionalidadPaisId: number;
  fechaCreacion?: string;
  activo: boolean;
}

export interface ReservaDto {
  id: number;
  codigoTicket: string;
  vueloId: number;
  usuarioRegistroId: number;
  fechaReserva: string;
  montoTotal: number;
  estadoReserva: string;
  activo: boolean;
}

export interface DetalleReservaDto {
  id: number;
  reservaId: number;
  pasajeroId: number;
  asientoVueloId: number;
  precioUnitario: number;
  fechaCreacion: string;
  activo: boolean;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  id?: number;
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

export type RolActivoType = 'SuperAdmin' | 'Administrador' | 'Operador' | 'Counter';
