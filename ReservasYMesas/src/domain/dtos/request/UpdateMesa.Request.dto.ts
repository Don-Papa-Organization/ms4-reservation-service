/**
 * DTO para actualizar una mesa existente
 */
export class UpdateMesaRequestDto {
  tipo?: 'VIP' | 'Barra' | "Salon";
  numero?: number;
  estado?: 'Disponible' | 'Reservada' | 'Ocupada' | 'Fuera de servicio';
}
