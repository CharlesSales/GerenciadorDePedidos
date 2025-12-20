import express from 'express'
import {listarCargo, criarRestaurante, listarRestaurantes, adicionarCouvert, statusCouvert} from '../controllers/restaurante.js'

const router = express.Router()

router.get('/restaurantes', listarRestaurantes)
router.get('/restaurantes/couvert/:id', statusCouvert)
router.get('/', listarCargo);
router.post("/auth/register", criarRestaurante)
router.put("/", adicionarCouvert)

export default router