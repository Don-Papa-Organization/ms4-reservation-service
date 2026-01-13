import { Request, Response } from "express";
import { MesaService } from "../services/mesaService";
import { MesaDto } from "../domain/dtos/mesaDto";

const mesaService = new MesaService();

/**
 * GET /api/mesas - Obtiene todas las mesas
 */
export const getAllMesas = async (req: Request, res: Response) => {
	try {
		const result = await mesaService.getAllMesas();
		return res.status(result.status).json(result.data || { message: result.message });
	} catch (error: any) {
		console.error("Error al obtener mesas:", error.message);
		return res.status(500).json({ message: "Error interno al obtener mesas." });
	}
};

/**
 * GET /api/mesas/:idMesa - Obtiene una mesa por ID
 */
export const getMesaById = async (req: Request, res: Response) => {
	try {
		const { idMesa } = req.params;

		if (!idMesa || isNaN(parseInt(idMesa))) {
			return res.status(400).json({ message: "idMesa inválido o no proporcionado." });
		}

		const result = await mesaService.getMesaById(parseInt(idMesa));
		return res.status(result.status).json(result.data || { message: result.message });
	} catch (error: any) {
		console.error("Error al obtener mesa:", error.message);
		return res.status(500).json({ message: "Error interno al obtener mesa." });
	}
};

/**
 * POST /api/mesas - Crea una nueva mesa
 */
export const createMesa = async (req: Request, res: Response) => {
	try {
		const { numero, tipo, estado }: MesaDto = req.body;

		const result = await mesaService.createMesa({ numero, tipo, estado });

		return res.status(result.status).json(result.data ? { message: "Mesa creada exitosamente.", mesa: result.data } : { message: result.message });
	} catch (error: any) {
		console.error("Error al crear mesa:", error.message);
		return res.status(500).json({ message: "Error interno al crear mesa." });
	}
};

/**
 * PUT /api/mesas/:idMesa - Actualiza una mesa
 */
export const updateMesa = async (req: Request, res: Response) => {
	try {
		const { idMesa } = req.params;
		const data: Partial<MesaDto> = req.body;

		if (!idMesa || isNaN(parseInt(idMesa))) {
			return res.status(400).json({ message: "idMesa inválido o no proporcionado." });
		}

		const result = await mesaService.updateMesa(parseInt(idMesa), data);

		return res.status(result.status).json(result.data ? { message: "Mesa actualizada exitosamente.", mesa: result.data } : { message: result.message });
	} catch (error: any) {
		console.error("Error al actualizar mesa:", error.message);
		return res.status(500).json({ message: "Error interno al actualizar mesa." });
	}
};

/**
 * PATCH /api/mesas/:idMesa/estado - Actualiza solo el estado de una mesa (empleado/administrador)
 */
export const updateMesaEstado = async (req: Request, res: Response) => {
	try {
		const { idMesa } = req.params;
		const { estado } = req.body;

		if (!idMesa || isNaN(parseInt(idMesa))) {
			return res.status(400).json({ message: "idMesa inválido o no proporcionado." });
		}

		if (!estado) {
			return res.status(400).json({ message: "estado es un campo obligatorio." });
		}

		const result = await mesaService.updateMesaEstado(parseInt(idMesa), estado);

		return res.status(result.status).json(result.data ? { message: result.message, mesa: result.data } : { message: result.message });
	} catch (error: any) {
		console.error("Error al actualizar estado de mesa:", error.message);
		return res.status(500).json({ message: "Error interno al actualizar estado de mesa." });
	}
};

/**
 * DELETE /api/mesas/:idMesa - Elimina una mesa
 */
export const deleteMesa = async (req: Request, res: Response) => {
	try {
		const { idMesa } = req.params;

		if (!idMesa || isNaN(parseInt(idMesa))) {
			return res.status(400).json({ message: "idMesa inválido o no proporcionado." });
		}

		const result = await mesaService.deleteMesa(parseInt(idMesa));

		return res.status(result.status).json({ message: result.message });
	} catch (error: any) {
		console.error("Error al eliminar mesa:", error.message);
		return res.status(500).json({ message: "Error interno al eliminar mesa." });
	}
};

/**
 * GET /api/mesas/estado/:estado - Obtiene mesas por estado
 */
export const getMesasByEstado = async (req: Request, res: Response) => {
	try {
		const { estado } = req.params;

		if (!estado) {
			return res.status(400).json({ message: "estado es un parámetro obligatorio." });
		}

		const result = await mesaService.getMesasByEstado(estado);

		return res.status(result.status).json(result.data || { message: result.message });
	} catch (error: any) {
		console.error("Error al obtener mesas por estado:", error.message);
		return res.status(500).json({ message: "Error interno al obtener mesas por estado." });
	}
};
