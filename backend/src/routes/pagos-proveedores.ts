import { Router } from 'express';
import { PagoProveedorController } from '../controllers/PagoProveedorController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/proveedor/:proveedorId', PagoProveedorController.getByProveedor);
router.get('/proveedor/:proveedorId/total', PagoProveedorController.getTotalPagos);
router.post('/', PagoProveedorController.create);

export default router;