import express from "express"
import { listarMesa, criarMesa } from "../controllers/mesa.js";

const router = express.Router()

router.get("/:id", listarMesa);
router.post("/", criarMesa)

export default router