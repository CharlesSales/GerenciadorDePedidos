import express from "express";
import { 
  relatorios, 
  relatoriosCompletos, 
  relatoriosComFiltros, 
  tendenciaTemporal 
} from "../controllers/relatorios.js";

const router = express.Router();

// Endpoint original (compatibilidade)
router.get("/", relatorios);

// Novo endpoint completo com todas as métricas
router.get("/completos", relatoriosCompletos);

// Endpoint com filtros específicos
router.get("/filtrados", relatoriosComFiltros);

// Endpoint para gráfico de tendência temporal
router.get("/tendencia", tendenciaTemporal);

export default router;