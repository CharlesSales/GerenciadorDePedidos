import "./globals.css";
import { CarrinhoProvider } from "../context/CarrinhoContext";
import Header from "../components/Header"; // 👈 versão cliente do Header

export const metadata = {
  title: "Acarajé da Mari",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <CarrinhoProvider>
          <Header /> {/* controla se mostra ou não */}
          {children}
        </CarrinhoProvider>
      </body>
    </html>
  );
}
