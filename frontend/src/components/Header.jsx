'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleToggle = () => setOpen(!open);

  const handleOption = (option) => {
    setOpen(false);
    if (option.startsWith('/')) {
      router.push(option); // navegação para páginas
    } else {
      console.log("Selecionou:", option); // ação interna
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleToggle}
        style={{
          padding: '3px 10px',
          fontSize: '24px',
          border: '15',
          background: 'transparent',
          cursor: 'pointer'
        }}
      >
        ⋮
      </button>

      {/* Menu */}
      {open && (
        <ul style={{
          position: 'absolute',
          top: 15,       // começa na altura do botão
          left: '100%', // abre à direita
          listStyle: 'none',
          margin: 0,
          padding: '10px',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 100,
          minWidth: '150px'
        }}>
           <li
            style={{ padding: '5px 10px', cursor: 'pointer' }}
            onClick={() => handleOption('/')}
          >
            Home
          </li>
          <li
            style={{ padding: '5px 10px', cursor: 'pointer' }}
            onClick={() => handleOption('/produtos')}
          >
            Produtos
          </li>
          <li
            style={{ padding: '5px 10px', cursor: 'pointer' }}
            onClick={() => handleOption('/pedido')}
          >
            Pedido
          </li>
          <li
            style={{ padding: '5px 10px', cursor: 'pointer' }}
            onClick={() => handleOption('/carrinho_acaraje')}
          >
            pedidos de acarajé
          </li>

        </ul>
      )}
    </div>
  );
}



/*
"use client";
import Link from "next/link";

export default function Header() {
  return (
    <nav style={{ display: "flex", gap: "20px", padding: "20px" }}>
      <Link href="/">Início</Link>
      <Link href="/produtos">Produtos</Link>
      <Link href="/carrinho">Carrinho</Link>
      <Link href="/pedido">Pedido</Link>
      <Link href="/status">Status</Link>

    </nav>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  // Se estiver na Home, não mostra o Header  
  if (pathname === "/"){
    return null
  } else{
    return (
    <nav style={{ display: "flex", gap: "20px", padding: "20px" }}>
      <Link href="/">Início</Link>
      <Link href="/produtos">Produtos</Link>
      <Link href="/carrinho">Carrinho</Link>
      <Link href="/pedido">Pedido</Link>
      <Link href="/status">Status</Link>

    </nav>
  );
  }
}
*/