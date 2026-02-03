import { Router } from "express";
import asyncHandler from "express-async-handler";
import {
	getAllMesas,
	getMesaById,
	createMesa,
	updateMesa,
	deleteMesa,
	getMesasByEstado,
	updateMesaEstado,
} from "../controllers/mesaController";
import { authenticateToken, requireRoles } from "../middlewares/authMiddleware";
import { TipoUsuario } from "../types/express";

const router = Router();

// GET todas las mesas (público)
router.get("/", asyncHandler(getAllMesas));

// GET mesa por ID (público)
router.get("/:idMesa", asyncHandler(getMesaById));

// GET mesas por estado (público)
router.get("/estado/:estado", asyncHandler(getMesasByEstado));

// POST crear mesa (requiere autenticación y rol administrador)
router.post(
	"/",
	authenticateToken,
	requireRoles(TipoUsuario.administrador),
	asyncHandler(createMesa)
);

// PUT actualizar mesa (requiere autenticación y rol administrador)
router.put(
	"/:idMesa",
	authenticateToken,
	requireRoles(TipoUsuario.administrador),
	asyncHandler(updateMesa)
);

// PATCH actualizar solo el estado de una mesa (requiere autenticación y rol empleado/administrador)
router.patch(
	"/:idMesa/estado",
	authenticateToken,
	requireRoles(TipoUsuario.empleado, TipoUsuario.administrador),
	asyncHandler(updateMesaEstado)
);

// DELETE eliminar mesa (requiere autenticación y rol administrador)
router.delete(
	"/:idMesa",
	authenticateToken,
	requireRoles(TipoUsuario.administrador),
	asyncHandler(deleteMesa)
);

export default router;
