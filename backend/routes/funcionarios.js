import express from "express"

import { listarFuncionarios, cadastrarFuncionario, criarFuncionario, editarFuncionario } from "../controllers/funcionarios.js"

const router = express.Router()

router.get("/", listarFuncionarios)
router.put("/:id/:campo/:novoValor", editarFuncionario);
router.post("/", cadastrarFuncionario)
router.post("/auth/register", criarFuncionario)

export default router