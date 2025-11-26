import { Router } from "express";
import { MesaController } from "../controllers/mesaController";

const router = Router();
const mesaController = new MesaController();

router.get('/estado/:estado', mesaController.getByEstado.bind(mesaController));
router.get('/', mesaController.getAll.bind(mesaController));
router.get('/:id', mesaController.getById.bind(mesaController));
router.post('/', mesaController.create.bind(mesaController));
router.put('/:id', mesaController.update.bind(mesaController));
router.delete('/:id', mesaController.delete.bind(mesaController));

export default router;
