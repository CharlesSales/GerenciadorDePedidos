import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import produtosRoutes from "./routes/produtos.js"
import funcionariosRoutes from "./routes/funcionarios.js"
import pedidosRestauranteRoutes from "./routes/pedidosRestaurante.js"
import pedidosAcarajeRoutes from "./routes/pedidosAcaraje.js"
import cargoRoutes from "./routes/cargo.js"
import categriaRoutes from "./routes/categoria.js"
import pedidosGeralRoutes from "./routes/pedidosGeral.js"
import pedidosRoutes from './routes/pedidos.js'
import relatoriosRoutes from "./routes/relatorios.js"
import userRoutes from "./routes/user.js"
import restauranteRoutes from "./routes/restaurante.js"
import authRoutes from "./routes/auth.js"
import { Server } from "socket.io"
import http from "http"

// ✅ CARREGAR VARIÁVEIS DE AMBIENTE
dotenv.config()

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
app.use("/pedidosRestaurante", pedidosRestauranteRoutes)
app.use("/pedidosAcaraje", pedidosAcarajeRoutes)
app.use("/pedidosGeral", pedidosGeralRoutes)
app.use("/restaurante", restauranteRoutes)
app.use("/relatorios", relatoriosRoutes)
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
const PORT = process.env.PORT || 8080  // ✅ MUDANÇA: 3001 → 8080
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📡 API disponível em: http://localhost:${PORT}`)
  console.log(`🔐 Login: POST http://localhost:${PORT}/auth/login/funcionario`)
  console.log('✅ Backend inicializado!')
})
