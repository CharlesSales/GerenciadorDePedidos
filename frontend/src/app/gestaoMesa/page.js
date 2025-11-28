'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ListaMesas from '@/components/ListarMesa';

export default function MesasPage() {
    const [mesas, setMesas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const [filtro, setFiltro] = useState("");
    const [coluna, setColuna] = useState("numero_mesa");
    const { token, isAuthenticated, user } = useAuth();

    // ✅ CORREÇÃO: Usar optional chaining
    const restauranteId = user?.dados?.restaurante?.id_restaurante;

    console.log("User completo:", user);
    console.log("restauranteId:", restauranteId);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        // ✅ VERIFICAR SE user E restauranteId EXISTEM
        if (isHydrated && user && restauranteId) {
            carregarMesas();
        }
    }, [isHydrated, token, isAuthenticated, restauranteId, user]);

    const carregarMesas = async () => {
        try {
            if (!restauranteId) return;

            setLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gerenciadordepedidos.onrender.com";
            console.log(`body api: ${API_URL}/mesa/${restauranteId}`)

            const response = await fetch(`${API_URL}/mesa/${restauranteId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) return window.location.href = '/login';
                throw new Error(await response.text());
            }

            const data = await response.json();
            console.log("📦 Dados recebidos:", data);
            setMesas(Array.isArray(data) ? data : (data.data || []));
        } catch (err) {
            console.error('Erro ao carregar mesas:', err);
            setMesas([]);
        } finally {
            setLoading(false);
        }
    };

    console.log(`id da mesa: ${mesas?.id}`)

    // ✅ AGUARDAR USER CARREGAR
    if (!isHydrated || !user) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                Carregando...
            </div>
        );
    }

    // ✅ VERIFICAR SE TEM RESTAURANTE
    if (!restauranteId) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column' 
            }}>
                <h2>❌ Restaurante não encontrado</h2>
                <p>Usuário não possui restaurante vinculado.</p>
            </div>
        );
    }

    return (
        <ListaMesas
            mesas={mesas}
            loading={loading}
            filtro={filtro}
            setFiltro={setFiltro}
            coluna={coluna}
            setColuna={setColuna}
        />
    );
}