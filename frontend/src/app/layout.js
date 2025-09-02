import './globals.css';
import { CarrinhoProvider } from '../context/CarrinhoContext';
import Header from '../components/Header'; // 👈 importa o componente de navegação

export const metadata = {
  title: 'Sushi App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <CarrinhoProvider>
          <Header /> {/* 👈 insere o menu aqui */}
          {children}
        </CarrinhoProvider>
      </body>
    </html>
  );
}
