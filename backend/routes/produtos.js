import express from 'express';
import multer from "multer";
import { authenticateToken, authenticateTokenOptional, requireRestauranteAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { criarProdutoSchema, atualizarProdutoSchema, idProdutoSchema, restauranteProdutoParamsSchema, qrCodeProdutoParamsSchema } from '../validators/produtoValidator.js';
import { 
  listarProdutos, 
  buscarProdutoPorId,
  listarProdutosPorRestaurante,
  editarprodutos, 
  cadastrarProdutos,
  deletarProduto,
  listarProdutosPorQRcode
} from '../controllers/produtos.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// ✅ ROTAS SIMPLES SEM MIDDLEWARE
router.get('/', authenticateTokenOptional, listarProdutos);
router.get("/restaurante/:restauranteId", validate(restauranteProdutoParamsSchema, 'params'), listarProdutosPorRestaurante)
router.get("/mesa/:id_restaurante/:id_mesa", validate(qrCodeProdutoParamsSchema, 'params'), listarProdutosPorQRcode)
router.put("/:id", authenticateToken, requireRestauranteAdmin, validate(idProdutoSchema, 'params'), validate(atualizarProdutoSchema), editarprodutos);
router.post("/", authenticateToken, requireRestauranteAdmin, upload.single("imagem"), validate(criarProdutoSchema), cadastrarProdutos);
router.get('/:id', validate(idProdutoSchema, 'params'), buscarProdutoPorId);
router.delete('/:id', authenticateToken, requireRestauranteAdmin, validate(idProdutoSchema, 'params'), deletarProduto)

export default router;