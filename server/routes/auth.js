import { Router } from 'express';
import { register, login } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/test', (req, res) => {
    console.log('[TEST ROUTE] Received request');
    res.send('OK');
  });
export default router;