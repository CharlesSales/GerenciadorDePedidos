import express from "express"
import { listarOpcoesDeRetirada } from "../controllers/retirada.js"

const router = express.Router()

router.get("/", listarOpcoesDeRetirada)

export default router