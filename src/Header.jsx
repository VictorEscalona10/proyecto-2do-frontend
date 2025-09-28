import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <h1 className={styles.logoText}>MIGDALIS TORTA</h1>
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <Link to="/pedidos" className={styles.navLink}>PEDIDOS</Link>
          <Link to="/productos" className={styles.navLink}>PRODUCTOS</Link>
          <Link to="/horarios" className={styles.navLink}>HORARIOS & SUCURSALES</Link>
          <Link to="/nosotros" className={styles.navLink}>NOSOTROS</Link>
        </nav>

        <div className={styles.rightSection}>
          <Link to="/login" className={styles.loginButton}>
            <svg className={styles.loginIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={styles.loginText}>INGRESAR</span>
          </Link>
        </div>
      </div>
    </header>
  );
}