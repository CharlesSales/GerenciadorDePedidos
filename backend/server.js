import express from "express"
import cors from "cors"
import produtosRoutes from "./routes/produtos.js"
import funcionariosRoutes from "./routes/funcionarios.js"
import pedidosRestauranteRoutes from "./routes/pedidosRestaurante.js"
import pedidosAcarajeRoutes from "./routes/pedidosAcaraje.js"

const app = express()
app.use(cors())
app.use(express.json())

// rotas
app.use("/produtos", produtosRoutes)
app.use("/funcionarios", funcionariosRoutes)
app.use("/pedidosRestaurante", pedidosRestauranteRoutes )
app.use("/pedidosAcaraje", pedidosAcarajeRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))

