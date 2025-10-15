import express from 'express'
import {listarCargo, criarRestaurante } from '../controllers/restaurante.js'

const router = express.Router()

router.get('/', listarCargo);
router.post("/auth/register", criarRestaurante)
export default router