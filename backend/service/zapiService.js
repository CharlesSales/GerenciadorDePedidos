import fetch from 'node-fetch';

// ✅ CONFIGURAÇÃO REAL DA SUA INSTÂNCIA

  const BASE_URL = process.env.ZAPI_BASE_URL;
  const INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
  const TOKEN = process.env.ZAPI_TOKEN;
  const CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;


class ZApiService {

     
  constructor() {
    console.log('🔧 Z-API FoodFlow inicializado:', {
      baseUrl: process.env.ZAPI_BASE_URL,
      instanceId: process.env.ZAPI_INSTANCE_ID,
      token: process.env.ZAPI_TOKEN ,
      clientToken: process.env.ZAPI_CLIENT_TOKEN
    });
  }

  // 📱 ENVIAR MENSAGEM - FORMATO EXATO DA SUA URL
  async enviarMensagem(numero, mensagem) {
    try {
      // ✅ URL EXATA DA SUA INSTÂNCIA
      const url = `${BASE_URL}/instances/${INSTANCE_ID}/token/${TOKEN}/send-text`;
      
      const payload = {
        // phone: this.formatarNumero(numero),
        phone: numero,
        message: mensagem
      };

      const headers = {
        'Content-Type': 'application/json',
        'Client-Token': CLIENT_TOKEN
      };

      console.log('📤 Enviando WhatsApp via FoodFlow:');
      console.log('🔗 URL:', url);
      console.log('📱 Telefone:', payload.phone);
      console.log('📝 Mensagem (preview):', mensagem.substring(0, 100) + '...');

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      console.log('📡 Status resposta:', response.status);
      console.log('📦 Resposta Z-API:', data);

      // ✅ VERIFICAR SUCESSO
      if (response.ok && !data.error) {
        console.log('✅ WhatsApp enviado com sucesso via FoodFlow!');
        return { success: true, data };
      } else {
        console.error('❌ Erro na resposta Z-API:', data);
        throw new Error(`Z-API Error: ${data.error || data.message || 'Erro desconhecido'}`);
      }

    } catch (error) {
      console.error('❌ Erro ao enviar WhatsApp:', error);
      throw error;
    }
  }

  // ✅ VERIFICAR STATUS
  async verificarStatus() {
    try {
      const url = `${ZAPI_CONFIG.BASE_URL}/instances/${ZAPI_CONFIG.INSTANCE_ID}/token/${ZAPI_CONFIG.TOKEN}/status`;
      
      console.log('🔍 Verificando status FoodFlow:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      console.log('📊 Status FoodFlow:', data);
      return data;

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔧 FORMATAR NÚMERO BRASILEIRO
  formatarNumero(numero) {
    let numeroLimpo = numero.replace(/\D/g, '');
    
    // Adicionar código do Brasil se necessário
    if (numeroLimpo.length === 11 && !numeroLimpo.startsWith('55')) {
      numeroLimpo = '55' + numeroLimpo;
    } else if (numeroLimpo.length === 10) {
      numeroLimpo = '55' + numeroLimpo;
    }
    
    console.log('📱 Número formatado:', numero, '->', numeroLimpo);
    return numeroLimpo;
  }
}

export default new ZApiService();