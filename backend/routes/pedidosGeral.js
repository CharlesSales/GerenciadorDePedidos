import express from "express"

import { listarPedidos , cadastrarPedidos, editarPedidos } from "../controllers/pedidosGeral.js"

const router = express.Router()

router.get("/", listarPedidos)
router.post("/", cadastrarPedidos)
router.put("/:id", editarPedidos)

export default router