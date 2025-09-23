import express from "express"

import { registerToken } from "../controllers/user.js"

const router = express.Router()

router.post("/register-token", registerToken)

export default router