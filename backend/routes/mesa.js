import express from "express"
import { listarMesa, criarMesa, buscarMesaPorId } from "../controllers/mesa.js";

const router = express.Router()

router.get("/:id", listarMesa);
router.get("/buscar/:id", buscarMesaPorId);
router.post("/", criarMesa)

export default router