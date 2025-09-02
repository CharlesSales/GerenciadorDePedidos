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
