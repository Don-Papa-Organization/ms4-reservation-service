/**
 * DTO para actualizar una mesa existente
 */
export class UpdateMesaRequestDto {
  tipo?: 'VIP' | 'Regular';
  numero?: number;
  estado?: 'Disponible' | 'Reservada' | 'Ocupada' | 'Fuera de servicio';
}
