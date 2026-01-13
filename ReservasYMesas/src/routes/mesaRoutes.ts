import { Router } from "express";
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
router.get("/", getAllMesas);

// GET mesa por ID (público)
router.get("/:idMesa", getMesaById);

// GET mesas por estado (público)
router.get("/estado/:estado", getMesasByEstado);

// POST crear mesa (requiere autenticación y rol administrador)
router.post(
	"/",
	authenticateToken,
	requireRoles(TipoUsuario.administrador),
	createMesa
);

// PUT actualizar mesa (requiere autenticación y rol administrador)
router.put(
	"/:idMesa",
	authenticateToken,
	requireRoles(TipoUsuario.administrador),
	updateMesa
);

// PATCH actualizar solo el estado de una mesa (requiere autenticación y rol empleado/administrador)
router.patch(
	"/:idMesa/estado",
	authenticateToken,
	requireRoles(TipoUsuario.empleado, TipoUsuario.administrador),
	updateMesaEstado
);

// DELETE eliminar mesa (requiere autenticación y rol administrador)
router.delete(
	"/:idMesa",
	authenticateToken,
	requireRoles(TipoUsuario.administrador),
	deleteMesa
);

export default router;
