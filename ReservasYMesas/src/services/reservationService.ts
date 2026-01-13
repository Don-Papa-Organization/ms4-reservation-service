import { Request } from "express";
import { MesaRepository } from "../domain/repositories/mesaRepository";
import { ReservaRepository } from "../domain/repositories/reservaRepository";
import { Reserva } from "../domain/models";
import { extractToken } from "../middlewares/authMiddleware";
import { MesaService } from "./mesaService";
import { Mesa } from "../domain/models";
import { MesaDto } from "../domain/dtos/mesaDto";
import { ClientService } from "./apis/clientService";
import { Op } from "sequelize";
import { ReservaDto } from "../domain/dtos/reservaDto";

type ReservePayload = {
	idMesa: number;
	fechaReserva: string;
	cantidadPersonas: number;
};

type AvailabilityQuery = {
	fecha: string;
	hora: string;
	cantidadPersonas: number;
};


export class TableService {
	private mesaRepository = new MesaRepository();
	private mesaService = new MesaService();
	private reservaRepository = new ReservaRepository();
	private clientService = new ClientService();

	private toDtoReserva(reserva: Reserva): ReservaDto {
		return {
			idReserva: reserva.idReserva,
			estado: reserva.estado as "pendiente" | "confirmada" | "cancelada",
			fechaReserva: reserva.fechaReserva,
			idMesa: reserva.idMesa,
			idCliente: reserva.idCliente,
			cantidadPersonas: reserva.cantidadPersonas,
		};
	}

	private toDtoMesa(mesa: Mesa): MesaDto {
			return {
				idMesa: mesa.idMesa,
				numero: mesa.numero,
				tipo: mesa.tipo as "VIP" | "Regular",
				estado: mesa.estado as "Disponible" | "Reservada" | "Ocupada" | "Fuera de servicio",
			}
		}

	/**
	 * Crea una reserva para la mesa e indica el cliente asociado (id en el token).
	 */
	async reserveTable(payload: ReservePayload, req: Request) {
		const { idMesa, fechaReserva, cantidadPersonas } = payload;

		if (!req.user?.id) {
			return { status: 401, message: "No se pudo identificar al usuario autenticado." };
		}

		const token = extractToken(req);
		if (!token) {
			return { status: 401, message: "No se proporcionó access token." };
		}

		// Validar cliente en microservicio de usuarios
		const client = await this.clientService.getClientById(req.user.id, token);
		if (!client) {
			return { status: 404, message: "El usuario no existe como cliente. Regístrese para poder reservar." };
		}

		// Validar mesa
		const mesa = await this.mesaRepository.findById(idMesa);
		if (!mesa) {
			return { status: 404, message: "La mesa indicada no existe." };
		}
		if (mesa.estado !== "Disponible") {
			return { status: 409, message: "La mesa no está disponible para reservar." };
		}

		// Crear reserva
		const nuevaReserva = await this.reservaRepository.create({
			estado: "confirmada",
			fechaReserva: new Date(fechaReserva),
			idMesa,
			idCliente: req.user.id,
			cantidadPersonas,
		});

		await this.mesaService.updateTableStatusInternal(idMesa, "Reservada");

		return { status: 201, data: this.toDtoReserva(nuevaReserva) };
	}

	/**
	 * Obtiene las mesas disponibles para una fecha, hora y cantidad de personas.
	 */
	async getAvailability(query: AvailabilityQuery) {
		const { fecha, hora, cantidadPersonas } = query;

		try {
			// Construir dateTime base (sin minutos, por si el usuario busca por hora aproximada)
			const [year, month, day] = fecha.split('-');
			const [hours] = hora.split(':');
			const searchDate = new Date(`${year}-${month}-${day}T${hours}:00:00Z`);

			// Obtener todas las reservas para esa fecha y hora
			const reservasEnHora = await this.reservaRepository.findAll({
				where: {
					fechaReserva: {
						[Op.gte]: new Date(searchDate.getTime()),
						[Op.lt]: new Date(searchDate.getTime() + 60 * 60 * 1000), // Próxima hora
					},
				},
			});

			const mesasReservadas = new Set(reservasEnHora.map(r => r.idMesa));

			// Obtener todas las mesas
			const todasLasMesas = await this.mesaRepository.findAll();

			// Filtrar mesas disponibles
			const mesasDisponibles: MesaDto[] = todasLasMesas
				.filter(mesa => {
					// No está reservada o ocupada en ese horario
					if (mesasReservadas.has(mesa.idMesa)) return false;
					// Estado debe ser disponible
					if (mesa.estado !== 'Disponible') return false;
					// Por ahora asumimos que la capacidad es suficiente
					return true;
				})
				.map(mesa => this.toDtoMesa(mesa));

			return {
				status: 200,
				data: {
					fecha,
					hora,
					cantidadPersonas,
					mesasDisponibles,
					totalDisponibles: mesasDisponibles.length,
				},
			};
		} catch (error: any) {
			console.error('Error al obtener disponibilidad de mesas:', error.message);
			return {
				status: 500,
				message: 'Error interno al consultar disponibilidad de mesas.',
			};
		}
	}

	/**
	 * Obtiene el historial de reservas del cliente autenticado.
	 */
	async getReservationHistory(idCliente: number) {
		try {
			// Obtener todas las reservas del cliente con detalles de mesa (eager loading)
			const reservas = await this.reservaRepository.findAll({
				where: { idCliente },
				include: ['mesa'],
			});

			if (reservas.length === 0) {
				return {
					status: 200,
					data: {
						mensaje: 'No hay reservas registradas para este usuario.',
						reservas: [],
						total: 0,
					},
				};
			}

			// Enriquecer cada reserva con detalles de la mesa
			const reservasConDetalles = reservas.map((reserva) => ({
				...this.toDtoReserva(reserva),
				numeroMesa: reserva.mesa?.numero || '-',
				tipoMesa: reserva.mesa?.tipo || 'Desconocido',
			}));

			return {
				status: 200,
				data: {
					reservas: reservasConDetalles,
					total: reservasConDetalles.length,
				},
			};
		} catch (error: any) {
			console.error('Error al obtener historial de reservas:', error.message);
			return {
				status: 500,
				message: 'Error interno al consultar historial de reservas.',
			};
		}
	}

	/**
	 * Cancela una reserva si está dentro del plazo permitido (24 horas antes de la reserva).
	 */
	async cancelReservation(idReserva: number, idCliente: number) {
		try {
			// Obtener la reserva
			const reserva = await this.reservaRepository.findById(idReserva);
			if (!reserva) {
				return { status: 404, message: 'La reserva no existe.' };
			}

			// Validar que la reserva pertenece al cliente
			if (reserva.idCliente !== idCliente) {
				return { status: 403, message: 'No tiene permiso para cancelar esta reserva.' };
			}

			// Validar que la reserva está en estado que permite cancelación
			if (reserva.estado !== 'confirmada' && reserva.estado !== 'pendiente') {
				return { status: 409, message: `No se puede cancelar una reserva en estado "${reserva.estado}".` };
			}

			// Validar plazo de cancelación (24 horas antes de la reserva)
			const ahora = new Date();
			const tiempoRestante = reserva.fechaReserva.getTime() - ahora.getTime();
			const horasRestantes = tiempoRestante / (1000 * 60 * 60);

			if (horasRestantes < 24) {
				return {
					status: 409,
					message: 'No es posible cancelar la reserva. Debe hacerlo con al menos 24 horas de anticipación.',
				};
			}

			// Actualizar estado de la reserva
			const reservaActualizada = await this.reservaRepository.update(idReserva, { estado: 'cancelada' });

			await this.mesaService.updateTableStatusInternal(reserva.idMesa, 'Disponible');

			return {
				status: 200,
				message: 'Reserva cancelada exitosamente.',
				data: reservaActualizada,
			};
		} catch (error: any) {
			console.error('Error al cancelar reserva:', error.message);
			return {
				status: 500,
				message: 'Error interno al cancelar la reserva.',
			};
		}
	}

	/**
	 * Obtiene todas las reservas del día actual o de una fecha específica.
	 * Para uso del administrador.
	 */
	async getDailyReservations(fecha?: string) {
		try {
			// Usar fecha actual si no se proporciona
			const fechaBusqueda = fecha || new Date().toISOString().split('T')[0];

			// Construir inicio y fin del día
			const inicioDia = new Date(`${fechaBusqueda}T00:00:00Z`);
			const finDia = new Date(`${fechaBusqueda}T23:59:59Z`);

			// Obtener reservas del día
			const reservas = await this.reservaRepository.findAll({
				where: {
					fechaReserva: {
						[Op.gte]: inicioDia,
						[Op.lte]: finDia,
					},
				},
				include: ['mesa'],
			});

			if (reservas.length === 0) {
				return {
					status: 200,
					data: {
						mensaje: `No hay reservas registradas para el ${fechaBusqueda}.`,
						fecha: fechaBusqueda,
						reservas: [],
						total: 0,
					},
				};
			}

			// Enriquecer cada reserva con detalles de la mesa
			const reservasConDetalles = reservas.map((reserva) => ({
				...this.toDtoReserva(reserva),
				hora: reserva.fechaReserva.toISOString().split('T')[1].substring(0, 5), // HH:mm
				fechaCompleta: reserva.fechaReserva,
				numeroMesa: reserva.mesa?.numero || '-',
				tipoMesa: reserva.mesa?.tipo || 'Desconocido',
			}));
			

			// Ordenar por hora
			reservasConDetalles.sort((a, b) => 
				a.fechaCompleta.getTime() - b.fechaCompleta.getTime()
			);

			return {
				status: 200,
				data: {
					fecha: fechaBusqueda,
					reservas: reservasConDetalles,
					total: reservasConDetalles.length,
				},
			};
		} catch (error: any) {
			console.error('Error al obtener reservas del día:', error.message);
			return {
				status: 500,
				message: 'Error interno al consultar reservas del día.',
			};
		}
	}

	/**
	 * CU034: Consulta el estado actual de una reserva específica.
	 * El cliente puede verificar el estado de una reserva en tiempo real.
	 */
	async getReservationStatus(idReserva: number, idCliente: number) {
		try {
			// Obtener la reserva
			const reserva = await this.reservaRepository.findById(idReserva);
			if (!reserva) {
				return {
					status: 404,
					message: 'Número no válido. Verifique e intente nuevamente.',
				};
			}

			// Validar que la reserva pertenece al cliente autenticado
			if (reserva.idCliente !== idCliente) {
				return {
					status: 403,
					message: 'No tiene permiso para ver el estado de esta reserva.',
				};
			}

			// Obtener detalles de la mesa
			const mesa = await this.mesaRepository.findById(reserva.idMesa);

			return {
				status: 200,
				data: {
					idReserva: reserva.idReserva,
					estado: reserva.estado,
					fecha: reserva.fechaReserva.toISOString().split('T')[0],
					hora: reserva.fechaReserva.toISOString().split('T')[1].substring(0, 5),
					numeroMesa: mesa?.numero || '-',
					tipoMesa: mesa?.tipo || 'Desconocido',
					cantidadPersonas: reserva.cantidadPersonas,
					horaEstimadaUso: reserva.fechaReserva.toISOString().split('T')[1].substring(0, 5),
				},
			};
		} catch (error: any) {
			console.error('Error al consultar estado de reserva:', error.message);
			return {
				status: 500,
				message: 'Error al consultar el estado. Intente más tarde.',
			};
		}
	}

	/**
	 * CU44: Confirmar una reserva que está en estado "pendiente".
	 * Permite a empleados y administradores confirmar reservas.
	 */
	async confirmReservation(idReserva: number) {
		try {
			// Obtener la reserva
			const reserva = await this.reservaRepository.findById(idReserva);
			if (!reserva) {
				return {
					status: 404,
					message: 'La reserva no existe o fue eliminada.',
				};
			}

			// Validar que la reserva está en estado "pendiente"
			if (reserva.estado !== 'pendiente') {
				return {
					status: 409,
					message: `La reserva ya está ${reserva.estado}. No es posible modificar su estado.`,
				};
			}

			// Actualizar estado a "confirmada"
			const reservaActualizada = await this.reservaRepository.update(idReserva, { estado: 'confirmada' });

			return {
				status: 200,
				message: 'Reserva confirmada exitosamente.',
				data: reservaActualizada,
			};
		} catch (error: any) {
			console.error('Error al confirmar reserva:', error.message);
			return {
				status: 500,
				message: 'Ocurrió un error al actualizar el estado. Intente nuevamente.',
			};
		}
	}

	/**
	 * CU44: Cancelar una reserva sin restricciones de tiempo.
	 * Permite a empleados y administradores cancelar reservas.
	 * Libera la mesa automáticamente si estaba reservada.
	 */
	async cancelReservationByStaff(idReserva: number) {
		try {
			// Obtener la reserva
			const reserva = await this.reservaRepository.findById(idReserva);
			if (!reserva) {
				return {
					status: 404,
					message: 'La reserva no existe o fue eliminada.',
				};
			}

			// Validar que no está ya cancelada
			if (reserva.estado === 'cancelada') {
				return {
					status: 409,
					message: 'La reserva ya está cancelada. No es posible modificar su estado.',
				};
			}

			// Actualizar estado a "cancelada"
			const reservaActualizada = await this.reservaRepository.update(idReserva, { estado: 'cancelada' });

			// Liberar la mesa si estaba reservada
			await this.mesaService.updateTableStatusInternal(reserva.idMesa, 'Disponible');

			return {
				status: 200,
				message: 'Reserva cancelada exitosamente.',
				data: reservaActualizada,
			};
		} catch (error: any) {
			console.error('Error al cancelar reserva por staff:', error.message);
			return {
				status: 500,
				message: 'Ocurrió un error al actualizar el estado. Intente nuevamente.',
			};
		}
	}

	/**
	 * CU44: Obtiene todas las reservas filtradas por estado.
	 * Permite a empleados y administradores ver reservas pendientes, confirmadas o canceladas.
	 */
	async getAllReservationsByStatus(estado?: string) {
		try {
			let reservas;

			if (estado) {
				// Validar que es un estado válido
				const estadosValidos = ['pendiente', 'confirmada', 'cancelada'];
				if (!estadosValidos.includes(estado.toLowerCase())) {
					return {
						status: 400,
						message: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}.`,
					};
				}

				reservas = await this.reservaRepository.findAll({
					where: { estado: estado.toLowerCase() },
					include: ['mesa'],
				});
			} else {
				reservas = await this.reservaRepository.findAll({
					include: ['mesa'],
				});
			}

			if (reservas.length === 0) {
				return {
					status: 200,
					data: {
						mensaje: estado
							? `No hay reservas en estado "${estado}".`
							: 'No hay reservas registradas.',
						estado: estado || 'todas',
						reservas: [],
						total: 0,
					},
				};
			}

			// Enriquecer cada reserva con detalles de la mesa
			const reservasConDetalles = reservas.map((reserva) => ({
				...this.toDtoReserva(reserva),
				fecha: reserva.fechaReserva.toISOString().split('T')[0],
				hora: reserva.fechaReserva.toISOString().split('T')[1].substring(0, 5),
				numeroMesa: reserva.mesa?.numero || '-',
				tipoMesa: reserva.mesa?.tipo || 'Desconocido',
			}));

			return {
				status: 200,
				data: {
					estado: estado || 'todas',
					reservas: reservasConDetalles,
					total: reservasConDetalles.length,
				},
			};
		} catch (error: any) {
			console.error('Error al obtener reservas por estado:', error.message);
			return {
				status: 500,
				message: 'Ocurrió un error al obtener las reservas. Intente nuevamente.',
			};
		}
	}
}