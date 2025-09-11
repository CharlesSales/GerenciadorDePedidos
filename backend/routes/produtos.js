import express from "express"

import { listarProdutos, cadastrarProdutos } from "../controllers/produtos.js"

const router = express.Router()

router.get("/", listarProdutos)
router.post("/", cadastrarProdutos)

export default router