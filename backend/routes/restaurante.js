import express from 'express'
import { authenticateToken, requireRestauranteAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { criarRestauranteSchema, atualizarCouvertSchema, idRestauranteSchema } from '../validators/restauranteValidator.js'
import {listarCargo, criarRestaurante, listarRestaurantes, adicionarCouvert, statusCouvert} from '../controllers/restaurante.js'

const router = express.Router()

router.get('/restaurantes', listarRestaurantes)
router.get('/restaurantes/couvert/:id', validate(idRestauranteSchema, 'params'), statusCouvert)
router.get('/', listarCargo);
router.post("/auth/register", validate(criarRestauranteSchema), criarRestaurante)
router.put("/", authenticateToken, requireRestauranteAdmin, validate(atualizarCouvertSchema), adicionarCouvert)

export default router