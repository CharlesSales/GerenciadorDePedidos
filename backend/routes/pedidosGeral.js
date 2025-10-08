import express from "express"

import { listarPedidos , cadastrarPedidos, editarPedidos } from "../controllers/pedidosGeral.js"

const router = express.Router()

router.get("/", listarPedidos)
router.post("/", cadastrarPedidos)
router.put("/:id", editarPedidos)

router.get("/restaurante/:id", (req, res) => {
  const { id } = req.params;
  listarPedidosPorRestaurante(id)
    .then(pedidos => res.json(pedidos))
    .catch(err => res.status(500).json({ error: err.message }));
});


export default router