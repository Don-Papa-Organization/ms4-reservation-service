/**
 * DTO para actualizar una reserva existente
 */
export class UpdateReservaRequestDto {
  estado?: 'pendiente' | 'confirmada' | 'cancelada';
  fechaReserva?: Date;
  idMesa?: number;
  cantidadPersonas?: number;
}
