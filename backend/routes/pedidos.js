import express from 'express';
import { authenticateToken, requireFuncionarioOrAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { criarPedidoSchema, atualizarStatusPedidoSchema, idPedidoSchema, relatorioPedidoQuerySchema } from '../validators/pedidoValidator.js';
import {
  listarPedidos,
  buscarPedidoPorId,
  criarPedido,
  atualizarStatusPedido,
  relatorioVendas
} from '../controllers/pedidos.js';

const router = express.Router();

router.use(authenticateToken, requireFuncionarioOrAdmin);

// ✅ TODAS AS ROTAS AGORA EXIGEM AUTENTICAÇÃO E FILTRAM POR RESTAURANTE
router.get('/', listarPedidos);
router.get('/relatorio', validate(relatorioPedidoQuerySchema, 'query'), relatorioVendas);
router.get('/:id', validate(idPedidoSchema, 'params'), buscarPedidoPorId);
router.post('/', validate(criarPedidoSchema), criarPedido);
router.put('/:id/status', validate(idPedidoSchema, 'params'), validate(atualizarStatusPedidoSchema), atualizarStatusPedido);

export default router;