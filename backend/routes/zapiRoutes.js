import express from 'express';
import ZApiService from '../service/zapiService.js';

const router = express.Router();

// ✅ ROTA DE DEBUG - VERIFICAR CONFIGURAÇÕES
router.get('/debug', (req, res) => {
  try {
    const config = {
      baseUrl: process.env.ZAPI_BASE_URL,
      instanceId: process.env.ZAPI_INSTANCE_ID ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
      token: process.env.ZAPI_TOKEN ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
      clientToken: process.env.ZAPI_CLIENT_TOKEN ? 'CONFIGURADO' : 'NÃO CONFIGURADO'
    };

    res.json({
      success: true,
      message: 'Rota Z-API funcionando',
      config: config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ TESTAR CONEXÃO
router.get('/status', async (req, res) => {
  try {
    console.log('🔍 Rota /status chamada');
    const status = await ZApiService.verificarStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('❌ Erro na rota /status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ TESTE SIMPLES - SEM CONEXÃO Z-API
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Z-API routes working!',
    timestamp: new Date().toISOString()
  });
});

// ✅ TESTE COMPLETO
router.get('/teste-conexao', async (req, res) => {
  try {
    const { numero } = req.query;
    const numeroTeste = numero || '5571999999999';
    
    console.log('🧪 Testando conexão para número:', numeroTeste);
    
    const resultado = await ZApiService.testarConexao(numeroTeste);
    res.json({ success: true, resultado });
    
  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ ENVIAR MENSAGEM DE TESTE
router.post('/teste', async (req, res) => {
  try {
    console.log('📤 Rota POST /teste chamada');
    console.log('📝 Body recebido:', req.body);
    
    const { numero, mensagem } = req.body;
    
    if (!numero || !mensagem) {
      return res.status(400).json({ 
        success: false,
        error: 'Número e mensagem são obrigatórios',
        received: { numero: !!numero, mensagem: !!mensagem }
      });
    }

    console.log('📱 Enviando mensagem para:', numero);
    const resultado = await ZApiService.enviarMensagem(numero, mensagem);
    
    res.json({ success: true, resultado });

  } catch (error) {
    console.error('❌ Erro na rota POST /teste:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;