import { Router } from 'express';
import { ProveedorController } from '../controllers/ProveedorController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', ProveedorController.getAll);
router.get('/:id', ProveedorController.getById);
router.post('/', ProveedorController.create);
router.put('/:id', ProveedorController.update);
router.delete('/:id', ProveedorController.delete);

export default router;