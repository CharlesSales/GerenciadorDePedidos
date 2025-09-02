"use client";
import { useEffect, useState } from "react";
import Status from "@/components/Status";

const statusList = [
  "Pedido recebido",
  "Em preparo",
  "Saiu para entrega",
  "Entregue",
];

export default function StatusPage() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) =>
        prev < statusList.length - 1 ? prev + 1 : prev
      );
    }, 3000); // atualiza o status a cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 480,
        margin: "0 auto",
        textAlign: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: 8,
          color: "#2c3e50",
        }}
      >
        Acompanhe seu pedido
      </h1>

      <p
        style={{
          fontSize: "1.2rem",
          marginBottom: 32,
          color: "#34495e",
        }}
      >
        Número do pedido: <strong>#123456</strong>
      </p>

      <Status status={statusList[statusIndex]} />
    </div>
  );
}