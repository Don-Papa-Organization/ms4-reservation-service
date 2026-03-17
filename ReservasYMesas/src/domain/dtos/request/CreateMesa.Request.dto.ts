/**
 * DTO para crear una nueva mesa
 */
export class CreateMesaRequestDto {
  tipo!: 'VIP' | 'Barra' | "Salon" | "Varios";
  numero!: number;
}
