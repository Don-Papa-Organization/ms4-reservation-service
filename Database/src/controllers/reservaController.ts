import { Request, Response } from 'express';
import { BaseController } from './baseController';
import { Reserva } from '../models';
import { ReservaRepository } from '../repositories/reservaRepository';

export class ReservaController extends BaseController<Reserva> {
    private reservaRepository: ReservaRepository;

    constructor() {
        const reservaRepo = new ReservaRepository();
        super(reservaRepo);
        this.reservaRepository = reservaRepo;
    }

    async getByCliente(req: Request, res: Response): Promise<void> {
        try {
            const idCliente = this.validateId(req.params.idCliente);
            
            if (!idCliente) {
                res.status(400).json({
                    success: false,
                    error: 'ID de cliente inválido'
                });
                return;
            }

            const reservas = await this.reservaRepository.findByCliente(idCliente);
            
            reservas.length > 0
                ? res.json({ success: true, data: reservas })
                : res.status(404).json({
                    success: false,
                    error: 'No se encontraron reservas para este cliente'
                });
        } catch (error) {
            this.handleError(error, res, 'Error al buscar reservas del cliente');
        }
    }

    async getByEstado(req: Request, res: Response): Promise<void> {
        try {
            const { estado } = req.params;
            const estadosValidos = ['pendiente', 'confirmada', 'cancelada'];
            
            if (!estado || !estadosValidos.includes(estado)) {
                res.status(400).json({
                    success: false,
                    error: `Estado debe ser uno de: ${estadosValidos.join(', ')}`
                });
                return;
            }

            const reservas = await this.reservaRepository.findByEstado(estado);
            
            reservas.length > 0
                ? res.json({ success: true, data: reservas })
                : res.status(404).json({
                    success: false,
                    error: `No se encontraron reservas en estado: ${estado}`
                });
        } catch (error) {
            this.handleError(error, res, 'Error al buscar reservas por estado');
        }
    }
}