import express from "express"
import cors from "cors"
import produtosRoutes from "./routes/produtos.js"
import funcionariosRoutes from "./routes/funcionarios.js"
import pedidosRestauranteRoutes from "./routes/pedidosRestaurante.js"
import pedidosAcarajeRoutes from "./routes/pedidosAcaraje.js"
import pedidosGeralRoutes from "./routes/pedidosGeral.js"
import userRoutes from "./routes/user.js"
import { Server } from "socket.io"
import http from "http"

const app = express()
app.use(cors())
app.use(express.json())

// rotas
app.use("/produtos", produtosRoutes)
app.use("/funcionarios", funcionariosRoutes)
app.use("/pedidosRestaurante", pedidosRestauranteRoutes)
app.use("/pedidosAcaraje", pedidosAcarajeRoutes)
app.use("/pedidosGeral", pedidosGeralRoutes)
app.use("/user", userRoutes)

// cria servidor HTTP a partir do app
const server = http.createServer(app)

// configura socket.io
const io = new Server(server, {
  cors: { origin: "*" }
})

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id)

  // mensagem de teste
  socket.emit("mensagem", "Conexão feita com sucesso!")
  
  // exemplo de desconexão
  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id)
  })
})

// server.js
// ...
export { io }   // 👈 exporta aqui

// inicia servidor
const PORT = process.env.PORT || 3001
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
