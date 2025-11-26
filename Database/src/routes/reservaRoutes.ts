import { Router } from "express";
import { ReservaController } from "../controllers/reservaController";

const router = Router();
const reservaController = new ReservaController();

router.get('/cliente/:idCliente', reservaController.getByCliente.bind(reservaController));
router.get('/estado/:estado', reservaController.getByEstado.bind(reservaController));
router.get('/', reservaController.getAll.bind(reservaController));
router.get('/:id', reservaController.getById.bind(reservaController));
router.post('/', reservaController.create.bind(reservaController));
router.put('/:id', reservaController.update.bind(reservaController));
router.delete('/:id', reservaController.delete.bind(reservaController));

export default router;
