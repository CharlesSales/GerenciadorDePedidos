import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CarrinhoProvider } from "../context/CarrinhoContext";
import { RestauranteProvider } from "../context/RestauranteContext";
import Header from "../components/Header";

export const metadata = {
  title: "Sales Manager",
  description: "Sistema de pedidos e gestão de restaurante",
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
