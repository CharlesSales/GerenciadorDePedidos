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
          <Link href="/pedidos_geral" className={styles.primary}>
            PEDIDOS GERAL
          </Link>
          
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Acarajé da Mari</p>
      </footer>
    </div>
  );
}
