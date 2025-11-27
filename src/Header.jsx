import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from './context/CartContext';
import CartDropdown from './components/pages/CartDropdown';
import styles from './Header.module.css';

export default function Header({ onShowModal }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getTotalItems } = useCart();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <Link to="/" className={styles.logoLink}>
            <div className={styles.logoContainer}>
              <img 
                src="/src/assest/img/logo.jpg" 
                alt="Logo" 
                className={styles.logoImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <h1 className={styles.logoText}>MIGDALIS TORTAS</h1>
            </div>
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <Link to="/pedidos" className={styles.navLink}>PEDIDOS</Link>
          <Link to="/Products" className={styles.navLink}>PRODUCTOS</Link>
          <Link to="/About" className={styles.navLink}>NOSOTROS</Link>
        </nav>

        <div className={styles.rightSection}>
          {/* Botón del Carrito */}
          <button 
            className={styles.cartButton}
            onClick={() => setIsCartOpen(true)}
          >
            <svg className={styles.cartIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.4 5.2 16.4H17M17 13V16.4M17 16.4C15.8 16.4 14.8 17.4 14.8 18.6C14.8 19.8 15.8 20.8 17 20.8C18.2 20.8 19.2 19.8 19.2 18.6C19.2 17.4 18.2 16.4 17 16.4ZM9 18.6C9 19.8 8 20.8 6.8 20.8C5.6 20.8 4.6 19.8 4.6 18.6C4.6 17.4 5.6 16.4 6.8 16.4C8 16.4 9 17.4 9 18.6Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            {getTotalItems() > 0 && (
              <span className={styles.cartBadge}>{getTotalItems()}</span>
            )}
          </button>

          {/* Botón de Login */}
          <Link to="/login" className={styles.loginButton}>
            <svg className={styles.loginIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Dropdown del Carrito - Ahora con onShowModal */}
      <CartDropdown 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onShowModal={onShowModal}
      />
    </header>
  );
}