import { Router } from 'express';
import { VentaController } from '../controllers/VentaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', VentaController.getAll);
router.get('/pendientes', VentaController.getPendientes);
router.get('/hoy/estadisticas', VentaController.getEstadisticasHoy);
router.get('/cliente/:clienteId', VentaController.getByCliente);
router.get('/:id', VentaController.getById);
router.post('/', VentaController.create);
router.put('/:id', VentaController.update);
router.delete('/:id', VentaController.delete);

export default router;