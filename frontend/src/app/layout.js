'use client';
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CarrinhoProvider } from "../context/CarrinhoContext";
import { RestauranteProvider } from "../context/RestauranteContext";
import Header from "../components/Header";

// ✅ METADATA MOVIDA PARA COMPONENTE CLIENTE
const AppMetadata = () => {
  if (typeof document !== 'undefined') {
    document.title = "Acarajé da Mari";
  }
  return null;
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <AppMetadata />
        <AuthProvider>
          <RestauranteProvider>
            <CarrinhoProvider>
              <Header />
              {children}
            </CarrinhoProvider>
          </RestauranteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
