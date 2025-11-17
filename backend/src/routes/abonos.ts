import { Router } from 'express';
import { AbonoController } from '../controllers/AbonoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/cliente/:clienteId', AbonoController.getByCliente);
router.get('/cliente/:clienteId/total', AbonoController.getTotalAbonos);
router.post('/', AbonoController.create);

export default router;