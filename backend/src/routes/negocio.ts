import { Router } from 'express';
import { NegocioController } from '../controllers/NegocioController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', NegocioController.get);
router.put('/:id', NegocioController.update);

export default router;