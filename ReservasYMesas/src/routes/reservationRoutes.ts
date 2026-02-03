import { Router } from "express";
import asyncHandler from "express-async-handler";
import { checkAvailability, reserveTable, getReservationHistory, cancelReservation, getDailyReservations, getReservationStatus, confirmReservation, cancelReservationByStaff, getAllReservationsByStatus } from "../controllers/reservationController";
import { authenticateToken, requireUsuarioActivo, requireRoles } from "../middlewares/authMiddleware";
import { TipoUsuario } from "../types/express";

const router = Router();

// Ruta pública: consultar disponibilidad (sin autenticación obligatoria)
router.get("/availability", asyncHandler(checkAvailability));

// Ruta protegida: reservar mesa (requiere autenticación y ser cliente)
router.post("/reserve", authenticateToken, requireUsuarioActivo, requireRoles(TipoUsuario.cliente), asyncHandler(reserveTable));

// Ruta protegida: historial de reservas (requiere autenticación y ser cliente)
router.get("/history", authenticateToken, requireUsuarioActivo, requireRoles(TipoUsuario.cliente), asyncHandler(getReservationHistory));

// Ruta protegida: visualizar reservas del día (requiere autenticación y rol administrador)
router.get("/daily", authenticateToken, requireUsuarioActivo, requireRoles(TipoUsuario.administrador, TipoUsuario.empleado), asyncHandler(getDailyReservations));

// CU44: Rutas para empleados y administradores

// Ruta protegida: obtener todas las reservas o filtradas por estado (requiere autenticación, usuario activo y rol de empleado/administrador)
// IMPORTANTE: Esta ruta debe ir ANTES de /:idReserva/status para evitar conflictos
router.get("/staff/status", authenticateToken, requireUsuarioActivo, requireRoles(TipoUsuario.empleado, TipoUsuario.administrador), asyncHandler(getAllReservationsByStatus));

// CU034: Ruta protegida: consultar estado de una reserva específica (requiere autenticación y ser cliente)
router.get("/:idReserva/status", authenticateToken, requireUsuarioActivo, requireRoles(TipoUsuario.cliente), asyncHandler(getReservationStatus));

// Ruta protegida: cancelar reserva (requiere autenticación y ser cliente)
router.delete("/:idReserva/cancel", authenticateToken, requireUsuarioActivo, requireRoles(TipoUsuario.cliente), asyncHandler(cancelReservation));

// Ruta protegida: confirmar una reserva (requiere autenticación, usuario activo y rol de empleado/administrador)
router.put("/:idReserva/confirm", authenticateToken, requireUsuarioActivo, requireRoles(TipoUsuario.empleado, TipoUsuario.administrador), asyncHandler(confirmReservation));

// Ruta protegida: cancelar una reserva por staff (requiere autenticación, usuario activo y rol de empleado/administrador)
router.delete("/:idReserva/cancel-staff", authenticateToken, requireUsuarioActivo, requireRoles(TipoUsuario.empleado, TipoUsuario.administrador), asyncHandler(cancelReservationByStaff));

export default router;
