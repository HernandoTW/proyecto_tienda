import { Router } from 'express';
import authRoutes from './auth';
import clientesRoutes from './clientes';
import ventasRoutes from './ventas';
import productosRoutes from './productos';
import proveedoresRoutes from './proveedores';
import abonosRoutes from './abonos';
import pagosProveedoresRoutes from './pagos-proveedores';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clientes', clientesRoutes);
router.use('/ventas', ventasRoutes);
router.use('/productos', productosRoutes);
router.use('/proveedores', proveedoresRoutes);
router.use('/abonos', abonosRoutes);
router.use('/pagos-proveedores', pagosProveedoresRoutes);

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend de Tienda funcionando',
    timestamp: new Date().toISOString()
  });
});

export default router;