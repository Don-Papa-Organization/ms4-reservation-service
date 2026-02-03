import { Request, Response, NextFunction } from "express";
import { TableService } from "../services/reservationService";
import { ApiResponse } from "../types";
import { AppError } from "../middlewares/error.middleware";

const tableService = new TableService();

export const checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
	const { fecha, hora, cantidadPersonas } = req.query;

	if (!fecha || !hora || !cantidadPersonas) {
		throw new AppError("fecha, hora y cantidadPersonas son parámetros obligatorios.", 400);
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha as string)) {
		throw new AppError("fecha debe estar en formato YYYY-MM-DD.", 400);
	}

	if (!/^\d{2}:\d{2}$/.test(hora as string)) {
		throw new AppError("hora debe estar en formato HH:mm.", 400);
	}

	const resultado = await tableService.getAvailability({
		fecha: fecha as string,
		hora: hora as string,
		cantidadPersonas: parseInt(cantidadPersonas as string),
	});

	const response: ApiResponse<any> = {
		success: resultado.status >= 200 && resultado.status < 300,
		data: resultado.data || null,
		message: resultado.message || "Disponibilidad verificada correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(resultado.status).json(response);
};

export const reserveTable = async (req: Request, res: Response, next: NextFunction) => {
	const { idMesa, fechaReserva, cantidadPersonas } = req.body;
	console.log("Reserva request body:");
	console.log(req.body);
	
	if (!idMesa || !fechaReserva || !cantidadPersonas) {
		throw new AppError("idMesa, fechaReserva y cantidadPersonas son obligatorios.", 400);
	}
	
	console.log(`Usuario autenticado: ${JSON.stringify(req.user)}`);
	const result = await tableService.reserveTable({ idMesa, fechaReserva, cantidadPersonas }, req);

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Reserva creada correctamente.",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

export const getReservationHistory = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user?.id) {
		throw new AppError("No se pudo identificar al usuario autenticado.", 401);
	}
	
	const result = await tableService.getReservationHistory(req.user.id);

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Historial obtenido correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

export const cancelReservation = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user?.id) {
		throw new AppError("No se pudo identificar al usuario autenticado.", 401);
	}

	const { idReserva } = req.params;

	if (!idReserva || isNaN(parseInt(idReserva))) {
		throw new AppError("idReserva inválido o no proporcionado.", 400);
	}

	const result = await tableService.cancelReservation(parseInt(idReserva), req.user.id);

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Reserva cancelada correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

export const getDailyReservations = async (req: Request, res: Response, next: NextFunction) => {
	const { fecha } = req.query;

	// Validar formato de fecha si se proporciona
	if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha as string)) {
		throw new AppError("fecha debe estar en formato YYYY-MM-DD.", 400);
	}
	
	const result = await tableService.getDailyReservations(fecha as string | undefined);

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Reservas del día obtenidas correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

/**
 * CU034: Consultar estado de reserva actual
 * Permite al cliente verificar el estado en tiempo real de una reserva
 */
export const getReservationStatus = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user?.id) {
		throw new AppError("No se pudo identificar al usuario autenticado.", 401);
	}

	const { idReserva } = req.params;

	if (!idReserva || isNaN(parseInt(idReserva))) {
		throw new AppError("Número no válido. Verifique e intente nuevamente.", 400);
	}

	const result = await tableService.getReservationStatus(parseInt(idReserva), req.user.id);

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Estado obtenido correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

/**
 * CU44: Confirmar una reserva
 * Permite a empleados y administradores confirmar reservas en estado pendiente
 */
export const confirmReservation = async (req: Request, res: Response, next: NextFunction) => {
	const { idReserva } = req.params;

	if (!idReserva || isNaN(parseInt(idReserva))) {
		throw new AppError("idReserva inválido o no proporcionado.", 400);
	}

	const result = await tableService.confirmReservation(parseInt(idReserva));

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Reserva confirmada correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

/**
 * CU44: Cancelar una reserva (staff)
 * Permite a empleados y administradores cancelar reservas sin restricción de tiempo
 */
export const cancelReservationByStaff = async (req: Request, res: Response, next: NextFunction) => {
	const { idReserva } = req.params;

	if (!idReserva || isNaN(parseInt(idReserva))) {
		throw new AppError("idReserva inválido o no proporcionado.", 400);
	}

	const result = await tableService.cancelReservationByStaff(parseInt(idReserva));

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Reserva cancelada correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};

/**
 * CU44: Obtener reservas filtradas por estado
 * Permite a empleados y administradores ver todas las reservas o filtradas por estado
 */
export const getAllReservationsByStatus = async (req: Request, res: Response, next: NextFunction) => {
	const { estado } = req.query;

	const result = await tableService.getAllReservationsByStatus(estado as string | undefined);

	const response: ApiResponse<any> = {
		success: result.status >= 200 && result.status < 300,
		data: result.data || null,
		message: result.message || "Reservas obtenidas correctamente",
		timestamp: new Date().toISOString()
	};
	
	res.status(result.status).json(response);
};
