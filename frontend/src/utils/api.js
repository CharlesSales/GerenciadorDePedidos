const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const fetchWithAuth = async (url, options = {}) => {
  // Verificar se estamos no browser
  if (typeof window === 'undefined') {
    throw new Error('fetchWithAuth só pode ser usado no cliente')
  }

  const token = localStorage.getItem('token')
  
  console.log("🔍 === REQUISIÇÃO COM AUTH ===")
  console.log("   URL:", `${API_URL}${url}`)
  console.log("   Token existe:", !!token)
  console.log("   Token:", token ? token.substring(0, 50) + '...' : 'null')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  console.log("📤 Headers enviados:", config.headers)

  try {
    const response = await fetch(`${API_URL}${url}`, config)
    
    console.log("📥 Status da resposta:", response.status)
    
    if (response.status === 401) {
      console.log("❌ Token expirado ou inválido - redirecionando")
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return null
    }

    return response
  } catch (err) {
    console.error("❌ Erro na requisição:", err)
    throw err
  }
}

// Função para requisições sem auth
export const fetchWithoutAuth = async (url, options = {}) => {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  return await fetch(`${API_URL}${url}`, config)
}