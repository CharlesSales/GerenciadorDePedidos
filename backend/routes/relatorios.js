import express from "express"

import { relatorios } from "../controllers/relatorios.js"

const router = express.Router()

router.get("/", relatorios)

export default router