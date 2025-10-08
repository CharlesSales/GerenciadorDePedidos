import express from "express"

import { listarFuncionarios, cadastrarFuncionario, criarFuncionario } from "../controllers/funcionarios.js"

const router = express.Router()

router.get("/", listarFuncionarios)
router.post("/", cadastrarFuncionario)
router.post("/auth/register", criarFuncionario)

export default router