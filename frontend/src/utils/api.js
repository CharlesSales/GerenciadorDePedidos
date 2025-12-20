const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const fetchWithAuth = async (url, options = {}) => {
  // Verificar se estamos no browser
  if (typeof window === 'undefined') {
    throw new Error('fetchWithAuth só pode ser usado no cliente')
  }

  const token = localStorage.getItem('token')
  
  ("🔍 === REQUISIÇÃO COM AUTH ===")
  ("   URL:", `${API_URL}${url}`)
  ("   Token existe:", !!token)
  ("   Token:", token ? token.substring(0, 50) + '...' : 'null')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  ("📤 Headers enviados:", config.headers)

  try {
    const response = await fetch(`${API_URL}${url}`, config)
    
    ("📥 Status da resposta:", response.status)
    
    if (response.status === 401) {
      ("❌ Token expirado ou inválido - redirecionando")
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