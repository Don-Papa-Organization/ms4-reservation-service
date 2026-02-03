/**
 * DTO de respuesta para Mesa
 */
export class MesaResponseDto {
  idMesa!: number;
  tipo!: 'VIP' | 'Regular';
  numero!: number;
  estado!: 'Disponible' | 'Reservada' | 'Ocupada' | 'Fuera de servicio';
  createdAt?: string;
  updatedAt?: string;
}
