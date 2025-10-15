import express from "express"

import { listarCategorias} from "../controllers/categoria.js"

const router = express.Router()

router.get("/", listarCategorias)

export default router