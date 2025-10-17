'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarProduto({ token }) {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [cozinha, setCozinha] = useState('');
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

    if (!nome || !descricao || !preco || !estoque || !cozinha || !categoria || !restaurante || !imagem) {
      setErrorMsg('Todos os campos são obrigatórios, incluindo a imagem.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('descricao', descricao);
      formData.append('preco', preco);
      formData.append('estoque', estoque);
      formData.append('cozinha', cozinha);
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
        setCozinha('');
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

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍔</div>
          <h1 style={{ margin: 0, color: '#dc3545', fontSize: '28px' }}>Novo Produto</h1>
          <p style={{ color: '#6c757d', margin: '8px 0 0 0' }}>Cadastro</p>
        </div>

        {errorMsg && <div style={alertError}>⚠️ {errorMsg}</div>}
        {successMsg && <div style={alertSuccess}>{successMsg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Preço" value={preco} onChange={e => setPreco(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Estoque" value={estoque} onChange={e => setEstoque(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Cozinha" value={cozinha} onChange={e => setCozinha(e.target.value)} style={inputStyle} />

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={{ ...inputStyle, backgroundColor: 'white', color: '#212529' }}
          >
            <option value="">Selecione uma categoria</option>
            {categoriaList.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>


          {/* Upload de imagem */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{
              border: isDragging ? '2px dashed #dc3545' : '2px dashed #ccc',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: isDragging ? '#fff5f5' : '#fafafa',
              transition: '0.2s'
            }}
          >
            <label htmlFor="imagem" style={{ cursor: 'pointer', color: '#dc3545', fontWeight: 'bold' }}>
              {preview ? '🖼️ Alterar imagem' : '📤 Arraste ou clique para enviar imagem'}
            </label>
            <input
              id="imagem"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />

            {preview && (
              <div style={{ marginTop: '16px' }}>
                <img src={preview} alt="Pré-visualização" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} style={{ ...inputStyle, backgroundColor: loading ? '#6c757d' : '#dc3545', color: 'white', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Cadastrando...' : '🚀 Cadastrar'}
          </button>
        </form>

        <button
          onClick={() => router.push('/gestaoProdutos')}
          style={{ ...inputStyle, backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', marginTop: '20px' }}
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
