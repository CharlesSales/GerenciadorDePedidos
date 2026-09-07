import express from "express"
import { authenticateToken, requireRestauranteAdmin } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { criarFuncionarioSchema, atualizarFuncionarioSchema, idFuncionarioSchema } from "../validators/funcionarioValidator.js"

import { listarFuncionarios, buscarFuncionarioPorId, criarFuncionario, editarFuncionario, deletarFuncionario } from "../controllers/funcionarios.js"

const router = express.Router()

router.use(authenticateToken)
router.get("/", listarFuncionarios)
router.get("/:id", validate(idFuncionarioSchema, 'params'), buscarFuncionarioPorId)
router.put("/:id", requireRestauranteAdmin, validate(idFuncionarioSchema, 'params'), validate(atualizarFuncionarioSchema), editarFuncionario)
router.post("/", requireRestauranteAdmin, validate(criarFuncionarioSchema), criarFuncionario)
router.post("/auth/register", requireRestauranteAdmin, validate(criarFuncionarioSchema), criarFuncionario)
router.delete('/:id', requireRestauranteAdmin, validate(idFuncionarioSchema, 'params'), deletarFuncionario)

export default router