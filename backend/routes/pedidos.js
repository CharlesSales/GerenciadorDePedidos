import express from 'express';
import {
  listarPedidos,
  buscarPedidoPorId,
  criarPedido,
  atualizarStatusPedido,
  relatorioVendas
} from '../controllers/pedidos.js';

const router = express.Router();

// ✅ TODAS AS ROTAS AGORA EXIGEM AUTENTICAÇÃO E FILTRAM POR RESTAURANTE
router.get('/', listarPedidos);
router.get('/relatorio', relatorioVendas);
router.get('/:id', buscarPedidoPorId);
router.post('/', criarPedido);
router.put('/:id/status', atualizarStatusPedido);

export default router;