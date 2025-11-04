export const ZAPI_CONFIG = {
  BASE_URL: process.env.ZAPI_BASE_URL || 'https://api.z-api.io',
  INSTANCE_ID: process.env.ZAPI_INSTANCE_ID,
  TOKEN: process.env.ZAPI_TOKEN,
  CLIENT_TOKEN: process.env.ZAPI_CLIENT_TOKEN
};

// Validar configurações
export const validateZApiConfig = () => {
  const { INSTANCE_ID, TOKEN, CLIENT_TOKEN } = ZAPI_CONFIG;
  
  if (!INSTANCE_ID || !TOKEN || !CLIENT_TOKEN) {
    throw new Error('❌ Configurações Z-API incompletas no .env');
  }
  
  return true;
};