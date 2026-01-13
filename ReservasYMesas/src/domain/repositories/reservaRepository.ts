import { BaseRepository } from "./baseRepository";
import { Reserva } from "../models";

export class ReservaRepository extends BaseRepository<Reserva> {
    constructor() {
        super(Reserva);
    }

    async findByCliente(idCliente: number): Promise<Reserva[]> {
        return this.model.findAll({ where: { idCliente } });
    }

    async findByEstado(estado: string): Promise<Reserva[]> {
        return this.model.findAll({ where: { estado } });
    }
}
