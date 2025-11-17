import { Router } from 'express';
import { ProductoController } from '../controllers/ProductoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', ProductoController.getAll);
router.get('/proveedor/:proveedorId', ProductoController.getByProveedor);
router.get('/:id', ProductoController.getById);
router.post('/', ProductoController.create);
router.put('/:id', ProductoController.update);
router.delete('/:id', ProductoController.delete);

export default router;