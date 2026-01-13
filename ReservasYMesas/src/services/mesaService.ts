import { MesaRepository } from "../domain/repositories/mesaRepository";
import { MesaDto } from "../domain/dtos/mesaDto";
import { Mesa } from "../domain/models";

export class MesaService {
	private mesaRepository = new MesaRepository();
	private readonly allowedEstados = ["Disponible", "Reservada", "Ocupada", "Fuera de servicio"];

	private toDto(mesa: Mesa): MesaDto {
		return {
			idMesa: mesa.idMesa,
			numero: mesa.numero,
			tipo: mesa.tipo as "VIP" | "Regular",
			estado: mesa.estado as "Disponible" | "Reservada" | "Ocupada" | "Fuera de servicio",
		}
	}

	/**
	 * Obtiene todas las mesas registradas.
	 */
	async getAllMesas() {
		try {
			const mesas = await this.mesaRepository.findAll();

			if (mesas.length === 0) {
				return {
					status: 200,
					data: {
						mensaje: "No hay mesas registradas.",
						mesas: [],
						total: 0,
					},
				};
			}

			return {
				status: 200,
				data: {
					mesas: mesas.map(mesa => this.toDto(mesa)),
					total: mesas.length,
				},
			};
		} catch (error: any) {
			console.error("Error al obtener mesas:", error.message);
			return {
				status: 500,
				message: "Error interno al obtener mesas.",
			};
		}
	}

	/**
	 * Obtiene una mesa por ID.
	 */
	async getMesaById(idMesa: number) {
		try {
			const mesa = await this.mesaRepository.findById(idMesa);

			if (!mesa) {
				return {
					status: 404,
					message: "La mesa no existe.",
				};
			}

			return {
				status: 200,
				data: this.toDto(mesa),
			};
		} catch (error: any) {
			console.error("Error al obtener mesa:", error.message);
			return {
				status: 500,
				message: "Error interno al obtener mesa.",
			};
		}
	}

	/**
	 * Crea una nueva mesa.
	 */
	async createMesa(data: MesaDto) {
		try {
			// Validar datos requeridos
			if (!data.numero || !data.tipo || !data.estado) {
				return {
					status: 400,
					message: "numero, tipo y estado son campos obligatorios.",
				};
			}

			// Validar que tipo sea válido
			if (!["VIP", "Regular"].includes(data.tipo)) {
				return {
					status: 400,
					message: "tipo debe ser 'VIP' o 'Regular'.",
				};
			}

			// Validar que estado sea válido
			if (!this.allowedEstados.includes(data.estado)) {
				return {
					status: 400,
					message: "estado debe ser 'Disponible', 'Reservada', 'Ocupada' o 'Fuera de servicio'.",
				};
			}

			const nuevaMesa = await this.mesaRepository.create({
				numero: data.numero,
				tipo: data.tipo,
				estado: data.estado,
			});

			return {
				status: 201,
				data: this.toDto(nuevaMesa),
			};
		} catch (error: any) {
			console.error("Error al crear mesa:", error.message);
			return {
				status: 500,
				message: "Error interno al crear mesa.",
			};
		}
	}

	/**
	 * Actualiza una mesa existente.
	 */
	async updateMesa(idMesa: number, data: Partial<MesaDto>) {
		try {
			// Validar que la mesa existe
			const mesaExistente = await this.mesaRepository.findById(idMesa);
			if (!mesaExistente) {
				return {
					status: 404,
					message: "La mesa no existe.",
				};
			}

			// Validar que tipo sea válido si se proporciona
			if (data.tipo && !["VIP", "Regular"].includes(data.tipo)) {
				return {
					status: 400,
					message: "tipo debe ser 'VIP' o 'Regular'.",
				};
			}

			// Validar que estado sea válido si se proporciona
			if (data.estado && !this.allowedEstados.includes(data.estado)) {
				return {
					status: 400,
					message: "estado debe ser 'Disponible', 'Reservada', 'Ocupada' o 'Fuera de servicio'.",
				};
			}

			const mesaActualizada = await this.mesaRepository.update(idMesa, {
				...(data.numero && { numero: data.numero }),
				...(data.tipo && { tipo: data.tipo }),
				...(data.estado && { estado: data.estado }),
			});

			return {
				status: 200,
				data: mesaActualizada ? this.toDto(mesaActualizada) : undefined,
			};
		} catch (error: any) {
			console.error("Error al actualizar mesa:", error.message);
			return {
				status: 500,
				message: "Error interno al actualizar mesa.",
			};
		}
	}

	/**
	 * Elimina una mesa.
	 */
	async deleteMesa(idMesa: number) {
		try {
			// Validar que la mesa existe
			const mesaExistente = await this.mesaRepository.findById(idMesa);
			if (!mesaExistente) {
				return {
					status: 404,
					message: "La mesa no existe.",
				};
			}

			const resultado = await this.mesaRepository.delete(idMesa);

			if (resultado === 0) {
				return {
					status: 404,
					message: "No se pudo eliminar la mesa.",
				};
			}

			return {
				status: 200,
				message: "Mesa eliminada exitosamente.",
			};
		} catch (error: any) {
			console.error("Error al eliminar mesa:", error.message);
			return {
				status: 500,
				message: "Error interno al eliminar mesa.",
			};
		}
	}

	/**
	 * Obtiene mesas por estado.
	 */
	async getMesasByEstado(estado: string) {
		try {
			if (!this.allowedEstados.includes(estado)) {
				return {
					status: 400,
					message: "estado inválido.",
				};
			}

			const mesas = await this.mesaRepository.findByEstado(estado);

			if (mesas.length === 0) {
				return {
					status: 200,
					data: {
						mensaje: `No hay mesas en estado "${estado}".`,
						mesas: [],
						total: 0,
					},
				};
			}

			return {
				status: 200,
				data: {
					mesas: mesas.map(mesa => this.toDto(mesa)),
					total: mesas.length,
				},
			};
		} catch (error: any) {
			console.error("Error al obtener mesas por estado:", error.message);
			return {
				status: 500,
				message: "Error interno al obtener mesas por estado.",
			};
		}
	}

	/**
	 * CU45: Actualiza solo el estado de una mesa (empleado/administrador).
	 */
	async updateMesaEstado(idMesa: number, nuevoEstado: string) {
		try {
			// Validar mesa existente
			const mesa = await this.mesaRepository.findById(idMesa);
			if (!mesa) {
				return {
					status: 404,
					message: "La mesa no existe.",
				};
			}

			// Validar estado permitido
			if (!this.allowedEstados.includes(nuevoEstado)) {
				return {
					status: 400,
					message: "estado debe ser 'Disponible', 'Reservada', 'Ocupada' o 'Fuera de servicio'.",
				};
			}

			// Si ya está en el estado solicitado, responder sin cambios
			if (mesa.estado === nuevoEstado) {
				return {
					status: 200,
					message: `La mesa ya está en estado "${nuevoEstado}".`,
					data: this.toDto(mesa),
				};
			}

			const mesaActualizada = await this.mesaRepository.update(idMesa, { estado: nuevoEstado });

			return {
				status: 200,
				message: "Estado de la mesa actualizado correctamente.",
				data: mesaActualizada ? this.toDto(mesaActualizada) : undefined,
			};
		} catch (error: any) {
			console.error("Error al actualizar estado de mesa:", error.message);
			return {
				status: 500,
				message: "Error interno al actualizar el estado de la mesa.",
			};
		}
	}

	/**
	 * Updates a table status internally (for use by other services).
	 * Used when reservations are created or cancelled.
	 */
	async updateTableStatusInternal(idMesa: number, estado: string): Promise<boolean> {
		try {
			const mesa = await this.mesaRepository.findById(idMesa);
			if (!mesa) {
				console.warn(`Table with ID ${idMesa} not found`);
				return false;
			}

			if (!this.allowedEstados.includes(estado)) {
				console.warn(`Invalid estado: ${estado}`);
				return false;
			}

			await this.mesaRepository.update(idMesa, { estado });
			return true;
		} catch (error: any) {
			console.error(`Error updating table status for ID ${idMesa}:`, error.message);
			return false;
		}
	}
}
