import express from 'express';
import { loginFuncionario, loginRestaurante } from '../controllers/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/authValidator.js';

const router = express.Router();

// ✅ ROTA DE DEBUG
router.get('/debug', (req, res) => {
  res.json({
    message: 'Rotas de auth funcionando!',
    rotas_disponiveis: [
      'POST /auth/funcionario',
      'POST /auth/restaurante',
      'GET /auth/debug'
    ]
  });
});

router.post('/funcionario', validate(loginSchema), loginFuncionario);
router.post('/restaurante', validate(loginSchema), loginRestaurante);

export default router;