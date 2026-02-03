import { MesaResponseDto } from "./Mesa.Response.dto";

/**
 * DTO de respuesta para Reserva
 */
export class ReservaResponseDto {
  idReserva!: number;
  estado!: 'pendiente' | 'confirmada' | 'cancelada';
  fechaReserva!: string;
  idMesa!: number;
  idCliente!: number;
  cantidadPersonas!: number;
  mesa?: MesaResponseDto;
  createdAt?: string;
  updatedAt?: string;
}
