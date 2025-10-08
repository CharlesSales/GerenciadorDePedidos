import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CarrinhoProvider } from "../context/CarrinhoContext";
import { RestauranteProvider } from "../context/RestauranteContext";
import Header from "../components/Header";

export const metadata = {
  title: "Acarajé da Mari",
  description: "Sistema de pedidos e gestão do restaurante Acarajé da Mari",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Componente cliente */}
        <AuthProvider>
          <CarrinhoProvider>
            <RestauranteProvider>
              <Header />
              {children}
            </RestauranteProvider>
          </CarrinhoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
