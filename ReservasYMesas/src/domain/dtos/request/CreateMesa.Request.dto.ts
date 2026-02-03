/**
 * DTO para crear una nueva mesa
 */
export class CreateMesaRequestDto {
  tipo!: 'VIP' | 'Regular';
  numero!: number;
}
