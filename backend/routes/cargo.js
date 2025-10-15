import express from "express"

import { listarCargo} from "../controllers/cargo.js"

const router = express.Router()

router.get("/", listarCargo)

export default router