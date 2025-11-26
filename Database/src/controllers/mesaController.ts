import { Request, Response } from 'express';
import { BaseController } from './baseController';
import { Mesa } from '../models';
import { MesaRepository } from '../repositories/mesaRepository';

export class MesaController extends BaseController<Mesa> {
    private mesaRepository: MesaRepository;

    constructor() {
        const mesaRepo = new MesaRepository();
        super(mesaRepo);
        this.mesaRepository = mesaRepo;
    }

    async getByEstado(req: Request, res: Response): Promise<void> {
        try {
            const { estado } = req.params;
            const estadosValidos = ['Disponible', 'Reservada', 'Ocupada', 'Fuerda de servicio'];
            
            if (!estado || !estadosValidos.includes(estado)) {
                res.status(400).json({
                    success: false,
                    error: `Estado debe ser uno de: ${estadosValidos.join(', ')}`
                });
                return;
            }

            const mesas = await this.mesaRepository.findByEstado(estado);
            
            mesas.length > 0
                ? res.json({ success: true, data: mesas })
                : res.status(404).json({
                    success: false,
                    error: `No se encontraron mesas en estado: ${estado}`
                });
        } catch (error) {
            this.handleError(error, res, 'Error al buscar mesas por estado');
        }
    }
}