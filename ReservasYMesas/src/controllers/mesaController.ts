import { Request, Response, NextFunction } from "express";
import { MesaService } from "../services/mesaService";
import { CreateMesaRequestDto } from "../domain/dtos/request/CreateMesa.Request.dto";
import { UpdateMesaRequestDto } from "../domain/dtos/request/UpdateMesa.Request.dto";
import { ApiResponse } from "../types";
import { AppError } from "../middlewares/error.middleware";

const mesaService = new MesaService();

/**
 * GET /api/mesas - Obtiene todas las mesas
 */
export const getAllMesas = async (req: Request, res: Response, next: NextFunction) => {
	const result = await mesaService.getAllMesas();
	
	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Mesas obtenidas correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

/**
 * GET /api/mesas/tipos - Obtiene tipos de mesa permitidos
 */
export const getMesaTipos = async (req: Request, res: Response, next: NextFunction) => {
	const response: ApiResponse<{ tipos: readonly string[] }> = {
		success: true,
		data: {
			tipos: mesaService.getAllowedTipos(),
		},
		message: "Tipos de mesa obtenidos correctamente",
		timestamp: new Date().toISOString()
	};

	res.status(200).json(response);
};

/**
 * GET /api/mesas/:idMesa - Obtiene una mesa por ID
 */
export const getMesaById = async (req: Request, res: Response, next: NextFunction) => {
	const { idMesa } = req.params;

	if (!idMesa || isNaN(parseInt(idMesa))) {
		throw new AppError("idMesa inválido o no proporcionado.", 400);
	}

	const result = await mesaService.getMesaById(parseInt(idMesa));
	
	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Mesa obtenida correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

/**
 * POST /api/mesas - Crea una nueva mesa
 */
export const createMesa = async (req: Request, res: Response, next: NextFunction) => {
	const { numero, tipo }: CreateMesaRequestDto = req.body;

	const result = await mesaService.createMesa({ numero, tipo });

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Mesa creada exitosamente.",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

/**
 * PUT /api/mesas/:idMesa - Actualiza una mesa
 */
export const updateMesa = async (req: Request, res: Response, next: NextFunction) => {
	const { idMesa } = req.params;
	const data: UpdateMesaRequestDto = req.body;

	if (!idMesa || isNaN(parseInt(idMesa))) {
		throw new AppError("idMesa inválido o no proporcionado.", 400);
	}

	const result = await mesaService.updateMesa(parseInt(idMesa), data);

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Mesa actualizada exitosamente.",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

/**
 * PATCH /api/mesas/:idMesa/estado - Actualiza solo el estado de una mesa (empleado/administrador)
 */
export const updateMesaEstado = async (req: Request, res: Response, next: NextFunction) => {
	const { idMesa } = req.params;
	const { estado } = req.body;

	if (!idMesa || isNaN(parseInt(idMesa))) {
		throw new AppError("idMesa inválido o no proporcionado.", 400);
	}

	if (!estado) {
		throw new AppError("estado es un campo obligatorio.", 400);
	}

	const result = await mesaService.updateMesaEstado(parseInt(idMesa), estado);

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Estado de mesa actualizado correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

/**
 * DELETE /api/mesas/:idMesa - Elimina una mesa
 */
export const deleteMesa = async (req: Request, res: Response, next: NextFunction) => {
	const { idMesa } = req.params;

	if (!idMesa || isNaN(parseInt(idMesa))) {
		throw new AppError("idMesa inválido o no proporcionado.", 400);
	}

	const result = await mesaService.deleteMesa(parseInt(idMesa));

	const response: ApiResponse<null> = {
		success: result.status >= 200 && result.status < 300,
		data: null,
		message: result.message || "Mesa eliminada correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

/**
 * GET /api/mesas/estado/:estado - Obtiene mesas por estado
 */
export const getMesasByEstado = async (req: Request, res: Response, next: NextFunction) => {
	const { estado } = req.params;

	if (!estado) {
		throw new AppError("estado es un parámetro obligatorio.", 400);
	}

	const result = await mesaService.getMesasByEstado(estado);

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Mesas obtenidas correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};
