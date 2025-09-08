import Link from "next/link";
import styles from "../page.module.css"; // ou outro CSS

export default function Home() {
  return (
    
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Bem-vindo ao Restaurante!</h1>
        <p>Escolha uma opção para começar:</p>

        <div className={styles.ctas}>
          
          
          <Link href="/pedidos_restaurante" className={styles.primary}>
            PEDIDOS DO RESTAURANTE
          </Link>
          <Link href="/pedidos_acaraje" className={styles.primary}>
            PEDIDOS DE ACARAJÉ
          </Link>
          
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Acarajé da Mari</p>
      </footer>
    </div>
    
    
    
    /*
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Bem-vindo ao Restaurante!</h1>
        <p>Escolha uma opção para começar:</p>

        <div className={styles.ctas}>
          
          
          <Link href="/produtos" className={styles.primary}>
            Cardápio
          </Link>
          <Link href="/carrinho" className={styles.primary}>
            Carrinho
          </Link>
          <Link href="/status" className={styles.primary}>
            Status do Pedido
          </Link>
          <Link href="/produtos" className={styles.primary}>
            Fazer Pedido
          </Link>
          
          
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Acarajé da Mari</p>
      </footer>
    </div>
    */
  );
}
