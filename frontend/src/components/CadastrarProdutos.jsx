'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarProduto({ token }) {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  // const [cozinha, setCozinha] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categoriaList, setCategoriaList] = useState([]);
  const [restaurante, setRestaurante] = useState('');
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";
  
  // Verificar Restaurante do usuário
  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setRestaurante(payload.restaurante_id);
    }
  }, [token]);
  
  // Selecionar arquivo
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImagem(file);
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
    } else {
      setErrorMsg('Por favor, envie um arquivo de imagem válido.');
    }
  };
  
  // Buscar categorias
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API_URL}/categoria`);
        const data = await res.json();
        setCategoriaList(data.map(c => ({ id: c.id, nome: c.categoria_nome?.trim() || "" })));
      } catch (err) {
        console.error('Erro ao carregar categorias', err);
      }
    };
    fetchCategorias();
  }, []);
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!nome || !descricao || !preco || !estoque || !categoria || !restaurante) {
      setErrorMsg('Todos os campos são obrigatórios, incluindo a imagem.');
      (`verificando qual campo esta falhando:\n${nome}\n${descricao}\n${preco}\n${estoque}\n${categoria}\n${restaurante}\n${imagem}`)
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('descricao', descricao);
      formData.append('preco', preco);
      formData.append('estoque', estoque);
      // formData.append('cozinha', cozinha);
      formData.append('categoria', categoria);
      formData.append('restaurante', restaurante);
      formData.append('imagem', imagem);
      
      const response = await fetch(`${API_URL}/produtos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setErrorMsg(data.msg || data.error || 'Erro ao cadastrar produto');
      } else {
        setSuccessMsg('✅ Produto cadastrado com sucesso!');
        setNome('');
        setDescricao('');
        setPreco('');
        setEstoque('');
        // setCozinha('');
        setCategoria('');
        setImagem(null);
        setPreview(null);
        
        setTimeout(() => router.push('/gestaoProdutos'), 500);
      }
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      setErrorMsg('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };
  
  const inputModern = {
    width: "100%",
    padding: "14px",
    border: "2px solid #eee",
  borderRadius: "10px",
  fontSize: "16px",
  backgroundColor: "#fff",
  transition: "0.2s",
};


  return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #ff4d4d, #ff6b6b, #ff8e8e)",
      padding: "20px",
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "20px",
        boxShadow: "0 6px 30px rgba(0,0,0,0.15)",
        padding: "40px",
        width: "100%",
        maxWidth: "450px",
        animation: "fadeIn 0.4s ease",
      }}
    >
      {/* Cabeçalho */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div
          style={{
            fontSize: "70px",
            marginBottom: "16px",
            filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.2))",
          }}
        >
          🍔
        </div>
        <h1
          style={{
            margin: 0,
            color: "#ff4d4d",
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          Novo Produto
        </h1>
        <p style={{ color: "#777", marginTop: "8px", fontSize: "16px" }}>
          Cadastro de item do cardápio
        </p>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div
          style={{
            backgroundColor: "#ffe6e6",
            color: "#b30000",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "20px",
            borderLeft: "5px solid #ff4d4d",
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            backgroundColor: "#e6ffe6",
            color: "#0d730d",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "20px",
            borderLeft: "5px solid #2ecc71",
          }}
        >
          {successMsg}
        </div>
      )}

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <input style={inputModern} type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input style={inputModern} type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <input style={inputModern} type="number" placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} />
        <input style={inputModern} type="number" placeholder="Estoque" value={estoque} onChange={(e) => setEstoque(e.target.value)} />
        {/* <input style={inputModern} type="text" placeholder="Cozinha" value={cozinha} onChange={(e) => setCozinha(e.target.value)} /> */}

        <select style={{ ...inputModern, backgroundColor: "#fff" }} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Selecione uma categoria</option>
          {categoriaList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        {/* Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: isDragging ? "2px dashed #ff4d4d" : "2px dashed #bbb",
            borderRadius: "14px",
            padding: "22px",
            textAlign: "center",
            backgroundColor: isDragging ? "#fff0f0" : "#f8f9fa",
            transition: "0.3s",
            cursor: "pointer",
          }}
        >
          <label htmlFor="imagem" style={{ cursor: "pointer", color: "#ff4d4d", fontWeight: "bold" }}>
            {preview ? "🖼️ Clique para alterar a imagem" : "📤 Arraste ou clique para enviar imagem"}
          </label>

          <input id="imagem" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />

          {preview && (
            <div style={{ marginTop: "16px" }}>
              <img src={preview} alt="Prévia" style={{ width: "100%", borderRadius: "12px", objectFit: "cover" }} />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? "#888" : "#ff4d4d",
            color: "white",
            padding: "14px",
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight: "bold",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "0.3s",
            boxShadow: "0 4px 10px rgba(255,77,77,0.4)",
          }}
        >
          {loading ? "⏳ Cadastrando..." : "🚀 Cadastrar"}
        </button>
      </form>

      <button
        onClick={() => router.push("/gestaoProdutos")}
        style={{
          marginTop: "20px",
          padding: "14px",
          backgroundColor: "#555",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          width: '100%',
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        ← Voltar
      </button>
    </div>
  </div>
);
}

// Estilos
const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', padding: '20px' };
const cardStyle = { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '40px', width: '100%', maxWidth: '420px' };
const inputStyle = { width: '100%', padding: '12px', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' };
const alertError = { backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' };
const alertSuccess = { backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' };
