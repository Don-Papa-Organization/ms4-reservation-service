import { BaseRepository } from "./baseRepository";
import { Mesa } from "../models";

export class MesaRepository extends BaseRepository<Mesa> {
    constructor() {
        super(Mesa);
    }

    async findByEstado(estado: string): Promise<Mesa[]> {
        return this.model.findAll({ where: { estado } });
    }
}
