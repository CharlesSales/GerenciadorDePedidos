import express from 'express';
import { loginFuncionario, loginRestaurante } from '../controllers/auth.js';

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

router.post('/funcionario', loginFuncionario);
router.post('/restaurante', loginRestaurante);

export default router;