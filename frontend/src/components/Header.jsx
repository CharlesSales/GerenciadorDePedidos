'use client';
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null); // referência do menu

  // Fecha o menu ao clicar fora
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

  const handleOption = (option) => {
    setOpen(false);
    if (option.startsWith("/")) {
      router.push(option);
    } else {
      console.log("Selecionou:", option);
    }
  };

  return (
    
    <div ref={menuRef} style={{
      marginBottom: "15px",
      padding: "10px",
      borderRadius: "6px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      position: "fixed",
      top: "10px",
      left: "10px",
      zIndex: 1000
    }}>
      {/* Botão hamburger */}
      <button
        onClick={handleToggle}
        style={{
          fontSize: "24px",
          padding: "5px 10px",
          cursor: "pointer",
          background: "transparent",
          border: "none"
        }}
      >
        ☰
      </button>

      {/* Menu */}
      {open && (
        <ul style={{
          position: "absolute",
          top: "40px",
          left: 0,
          listStyle: "none",
          margin: 0,
          padding: "10px",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "5px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          minWidth: "150px"
        }}>
          <li style={{ padding: "5px 10px", cursor: "pointer" }} onClick={() => handleOption("/")}>Home</li>
          <li style={{ padding: "5px 10px", cursor: "pointer" }} onClick={() => handleOption("/produtos")}>Produtos</li>
          <li style={{ padding: "5px 10px", cursor: "pointer" }} onClick={() => handleOption("/carrinho")}>Carrinho</li>
          <li style={{ padding: "5px 10px", cursor: "pointer" }} onClick={() => handleOption("/acaraje")}>Pedido</li>
          <li style={{ padding: "5px 10px", cursor: "pointer" }} onClick={() => handleOption("/status")}>Status</li>
        </ul>
      )}
    </div>
  );
}
