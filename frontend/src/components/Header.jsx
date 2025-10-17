'use client';
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const paginasComHeader = [
    '/', '/produtos', '/carrinho', '/pedidos_geral',
    '/funcionario', '/atualizarFuncionarios','/admin',
     '/cadastrarFuncionario'
  ];

  const paginasSemHeader = [
    '/login', '/register', '/unauthorized', 
    '/cadastrarRestaurante', '/gestaoFuncionarios', '/gestaoProdutos'];

  const deveExibirHeader = 
    !paginasSemHeader.some(r => pathname.startsWith(r)) &&
    paginasComHeader.some(r => pathname === r || pathname.startsWith(r));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => setOpen(!open);

  const handleLogout = () => {
    try {
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Produtos", path: "/produtos" },
    { label: "Carrinho", path: "/carrinho" },
    { label: "Pedido", path: "/pedidos_geral" },
    { label: "Sair", action: handleLogout },
  ];

  const menuAdmin = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Funcionários", path: "/admin/funcionarios" },
    { label: "Pedidos", path: "/admin/pedidos" },
    { label: "Sair", action: handleLogout },
  ];

  const menuGarcom = [
    { label: "Pedidos", path: "/garcom/pedidos" },
    { label: "Entregas", path: "/garcom/entregas" },
    { label: "Sair", action: handleLogout },
  ];

  const menuCozinha = [
    { label: "Fila de Pedidos", path: "/cozinha" },
    { label: "Sair", action: handleLogout },
  ];

  let menu = menuItems;
  if (user?.cargo === "Administrador") menu = menuAdmin;
  else if (user?.cargo === "garcom") menu = menuGarcom;
  else if (user?.cargo === "cozinha") menu = menuCozinha;

  // ✅ Mover a verificação para dentro do retorno
  if (!deveExibirHeader) return null;

  return (
    <div
      ref={menuRef}
      style={{
        marginBottom: "15px",
        padding: "10px",
        borderRadius: "6px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "fixed",
        top: "40px",
        right: "30px",
        zIndex: 1000,
      }}
    >
      <button
        onClick={handleToggle}
        style={{
          fontSize: "24px",
          padding: "5px 10px",
          cursor: "pointer",
          background: "transparent",
          border: "none",
        }}
      >
        ☰
      </button>

      {open && (
        <ul
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            listStyle: "none",
            margin: 0,
            padding: "10px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            minWidth: "150px",
          }}
        >
          {menu.map((item) => (
            <li
              key={item.label}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                borderRadius: "4px",
              }}
              onClick={() => {
                setOpen(false);
                if (item.action) item.action();
                else if (item.path) router.push(item.path);
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
