import { Request, Response } from "express";
import { TableService } from "../services/reservationService";

const tableService = new TableService();

export const checkAvailability = async (req: Request, res: Response) => {
	try {
		const { fecha, hora, cantidadPersonas } = req.query;

		if (!fecha || !hora || !cantidadPersonas) {
			return res.status(400).json({ message: "fecha, hora y cantidadPersonas son parámetros obligatorios." });
		}

		if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha as string)) {
			return res.status(400).json({ message: "fecha debe estar en formato YYYY-MM-DD." });
		}

		if (!/^\d{2}:\d{2}$/.test(hora as string)) {
			return res.status(400).json({ message: "hora debe estar en formato HH:mm." });
		}

		const resultado = await tableService.getAvailability({
			fecha: fecha as string,
			hora: hora as string,
			cantidadPersonas: parseInt(cantidadPersonas as string),
		});

		return res.status(resultado.status).json(resultado.data || { message: resultado.message });
	} catch (error: any) {
		console.error("Error al verificar disponibilidad:", error.message);
		return res.status(500).json({ message: "Error interno al verificar disponibilidad." });
	}
};

export const reserveTable = async (req: Request, res: Response) => {
	try {
		const { idMesa, fechaReserva, cantidadPersonas } = req.body;
		console.log("Reserva request body:");
		console.log(req.body);
		if (!idMesa || !fechaReserva || !cantidadPersonas) {
			return res.status(400).json({ message: "idMesa, fechaReserva y cantidadPersonas son obligatorios." });
		}
		console.log(`Usuario autenticado: ${JSON.stringify(req.user)}`);
		const result = await tableService.reserveTable({ idMesa, fechaReserva, cantidadPersonas }, req);

		if (result.status !== 201) {
			return res.status(result.status).json({ message: result.message });
		}

		return res.status(201).json({ message: "Reserva creada correctamente.", reserva: result.data });
	} catch (error: any) {
		console.error("Error al crear la reserva:", error.message);
		return res.status(500).json({ message: "Error interno al crear la reserva." });
	}
};

export const getReservationHistory = async (req: Request, res: Response) => {
	try {
		if (!req.user?.id) {
			return res.status(401).json({ message: "No se pudo identificar al usuario autenticado." });
		}
		
		const result = await tableService.getReservationHistory(req.user.id);

		return res.status(result.status).json(result.data || { message: result.message });
	} catch (error: any) {
		console.error("Error al obtener historial de reservas:", error.message);
		return res.status(500).json({ message: "Error interno al obtener historial de reservas." });
	}
};

export const cancelReservation = async (req: Request, res: Response) => {
	try {
		if (!req.user?.id) {
			return res.status(401).json({ message: "No se pudo identificar al usuario autenticado." });
		}

		const { idReserva } = req.params;

		if (!idReserva || isNaN(parseInt(idReserva))) {
			return res.status(400).json({ message: "idReserva inválido o no proporcionado." });
		}

		const result = await tableService.cancelReservation(parseInt(idReserva), req.user.id);

		return res.status(result.status).json(result.data ? { message: result.message, reserva: result.data } : { message: result.message });
	} catch (error: any) {
		console.error("Error al cancelar reserva:", error.message);
		return res.status(500).json({ message: "Error interno al cancelar la reserva." });
	}
};

export const getDailyReservations = async (req: Request, res: Response) => {
	try {
		const { fecha } = req.query;

		// Validar formato de fecha si se proporciona
		if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha as string)) {
			return res.status(400).json({ message: "fecha debe estar en formato YYYY-MM-DD." });
		}

		const result = await tableService.getDailyReservations(fecha as string | undefined);

		return res.status(result.status).json(result.data || { message: result.message });
	} catch (error: any) {
		console.error("Error al obtener reservas del día:", error.message);
		return res.status(500).json({ message: "Error interno al obtener reservas del día." });
	}
};

/**
 * CU034: Consultar estado de reserva actual
 * Permite al cliente verificar el estado en tiempo real de una reserva
 */
export const getReservationStatus = async (req: Request, res: Response) => {
	try {
		if (!req.user?.id) {
			return res.status(401).json({ message: "No se pudo identificar al usuario autenticado." });
		}

		const { idReserva } = req.params;

		if (!idReserva || isNaN(parseInt(idReserva))) {
			return res.status(400).json({ message: "Número no válido. Verifique e intente nuevamente." });
		}

		const result = await tableService.getReservationStatus(parseInt(idReserva), req.user.id);

		return res.status(result.status).json(result.data || { message: result.message });
	} catch (error: any) {
		console.error("Error al consultar estado de reserva:", error.message);
		return res.status(500).json({ message: "Error al consultar el estado. Intente más tarde." });
	}
};

/**
 * CU44: Confirmar una reserva
 * Permite a empleados y administradores confirmar reservas en estado pendiente
 */
export const confirmReservation = async (req: Request, res: Response) => {
	try {
		const { idReserva } = req.params;

		if (!idReserva || isNaN(parseInt(idReserva))) {
			return res.status(400).json({ message: "idReserva inválido o no proporcionado." });
		}

		const result = await tableService.confirmReservation(parseInt(idReserva));

		return res.status(result.status).json(result.data ? { message: result.message, reserva: result.data } : { message: result.message });
	} catch (error: any) {
		console.error("Error al confirmar reserva:", error.message);
		return res.status(500).json({ message: "Ocurrió un error al actualizar el estado. Intente nuevamente." });
	}
};

/**
 * CU44: Cancelar una reserva (staff)
 * Permite a empleados y administradores cancelar reservas sin restricción de tiempo
 */
export const cancelReservationByStaff = async (req: Request, res: Response) => {
	try {
		const { idReserva } = req.params;

		if (!idReserva || isNaN(parseInt(idReserva))) {
			return res.status(400).json({ message: "idReserva inválido o no proporcionado." });
		}

		const result = await tableService.cancelReservationByStaff(parseInt(idReserva));

		return res.status(result.status).json(result.data ? { message: result.message, reserva: result.data } : { message: result.message });
	} catch (error: any) {
		console.error("Error al cancelar reserva por staff:", error.message);
		return res.status(500).json({ message: "Ocurrió un error al actualizar el estado. Intente nuevamente." });
	}
};

/**
 * CU44: Obtener reservas filtradas por estado
 * Permite a empleados y administradores ver todas las reservas o filtradas por estado
 */
export const getAllReservationsByStatus = async (req: Request, res: Response) => {
	try {
		const { estado } = req.query;

		const result = await tableService.getAllReservationsByStatus(estado as string | undefined);

		return res.status(result.status).json(result.data || { message: result.message });
	} catch (error: any) {
		console.error("Error al obtener reservas por estado:", error.message);
		return res.status(500).json({ message: "Ocurrió un error al obtener las reservas. Intente nuevamente." });
	}
};
