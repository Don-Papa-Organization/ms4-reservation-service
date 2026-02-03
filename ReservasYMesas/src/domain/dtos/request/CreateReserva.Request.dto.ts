/**
 * DTO para crear una nueva reserva
 */
export class CreateReservaRequestDto {
  fechaReserva!: Date;
  idMesa!: number;
  idCliente!: number;
  cantidadPersonas!: number;
}
