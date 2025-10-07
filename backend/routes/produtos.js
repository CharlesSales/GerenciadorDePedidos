import express from 'express';
import { 
  listarProdutos, 
  buscarProdutoPorId
} from '../controllers/produtos.js';

const router = express.Router();

// ✅ ROTAS SIMPLES SEM MIDDLEWARE
router.get('/', listarProdutos);
router.get('/:id', buscarProdutoPorId);

export default router;