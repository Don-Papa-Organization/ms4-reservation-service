import { MesaDto } from "./mesaDto";

export interface ReservaDto {
  idReserva?: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  fechaReserva: Date;
  idMesa: number;
  idCliente: number;
  cantidadPersonas: number;
  mesa?: MesaDto;
}
