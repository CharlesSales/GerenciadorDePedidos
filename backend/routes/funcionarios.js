import express from "express"

import { listarFuncionarios, cadastrarFuncionario } from "../controllers/funcionarios.js"

const router = express.Router()

router.get("/", listarFuncionarios)
router.post("/", cadastrarFuncionario)

export default router