export interface MesaDto {
  idMesa?: number;
  tipo: 'VIP' | 'Regular';
  numero: number;
  estado: 'Disponible' | 'Reservada' | 'Ocupada' | 'Fuera de servicio';
}
