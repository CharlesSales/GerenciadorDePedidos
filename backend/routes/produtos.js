import express from 'express';
import multer from "multer";
import { 
  listarProdutos, 
  buscarProdutoPorId,
  listarProdutosPorRestaurante,
  editarprodutos, 
  cadastrarProdutos
} from '../controllers/produtos.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// ✅ ROTAS SIMPLES SEM MIDDLEWARE
router.get('/', listarProdutos);
router.get("/restaurante/:restauranteId", listarProdutosPorRestaurante)
router.put("/:id/:campo/:novoValor", editarprodutos);
router.post("/", upload.single("imagem"), cadastrarProdutos);
router.get('/:id', buscarProdutoPorId);

export default router;