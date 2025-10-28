import express from "express"

import { listarPedidos , cadastrarPedidos, editarPedidos, atualizarStatusPedido, listarStatusPedidos, cadastrarPedidosCliente } from "../controllers/pedidosGeral.js"

const router = express.Router()

router.get("/", listarPedidos)
router.post("/", cadastrarPedidos)
router.post("/cliente", cadastrarPedidosCliente)
router.put("/:id", editarPedidos)
router.put('/:id/status', atualizarStatusPedido);
router.get('/status', listarStatusPedidos);

router.get("/restaurante/:id", (req, res) => {
  const { id } = req.params;
  listarPedidosPorRestaurante(id)
    .then(pedidos => res.json(pedidos))
    .catch(err => res.status(500).json({ error: err.message }));
});

export default router