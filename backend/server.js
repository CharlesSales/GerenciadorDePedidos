import express from "express"
import cors from "cors"
import { env } from './config/env.js'
import produtosRoutes from "./routes/produtos.js"
import funcionariosRoutes from "./routes/funcionarios.js"
import cargoRoutes from "./routes/cargo.js"
import categriaRoutes from "./routes/categoria.js"
import pedidosRoutes from './routes/pedidos.js'
import restauranteRoutes from "./routes/restaurante.js"
import authRoutes from "./routes/auth.js"
import { Server } from "socket.io"
import http from "http"
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFound.js'



const app = express()
app.use(cors())
app.use(express.json())

// ✅ Rota raiz de verificação
app.get('/', (req, res) => {
  res.status(200).send('🚀 Servidor ativo e respondendo!');
});


// rotas
app.use("/auth", authRoutes)
app.use("/cargo", cargoRoutes)
app.use("/categoria", categriaRoutes)
app.use("/produtos", produtosRoutes)
app.use("/funcionarios", funcionariosRoutes)
app.use("/pedidos", pedidosRoutes) 
app.use("/restaurante", restauranteRoutes)
app.use(notFoundHandler)
app.use(errorHandler)


// cria servidor HTTP a partir do app
const server = http.createServer(app)

// configura socket.io
const io = new Server(server, {
  cors: { origin: "*" }
})

io.on("connection", (socket) => {

  // mensagem de teste
  socket.emit("mensagem", "Conexão feita com sucesso!")
  
})

// server.js
// ...
export { app, server, io }

// inicia servidor
if (env.nodeEnv !== 'test') {
  server.listen(env.port)
}
