import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', ClienteController.getAll);
router.get('/:id', ClienteController.getById);
router.get('/:id/saldo', ClienteController.getSaldo);
router.post('/', ClienteController.create);
router.put('/:id', ClienteController.update);
router.delete('/:id', ClienteController.delete);

export default router;