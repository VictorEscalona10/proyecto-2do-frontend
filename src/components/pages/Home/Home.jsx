import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  // Datos de los postres destacados
  const featuredProducts = [
    {
      id: 1,
      name: "Torta de Chocolate Suprema",
      description: "Deliciosa torta de chocolate con relleno de ganache y cubierta de buttercream.",
      emoji: "🎂",
      category: 'tortas'
    },
    {
      id: 2,
      name: "Cupcakes de Vainilla",
      description: "Esponjosos cupcakes de vainilla con decoración colorida y cremosa.",
      emoji: "🧁",
      category: 'ponques'
    },
    {
      id: 3,
      name: "Galletas Personalizadas",
      description: "Galletas decoradas a mano con diseños únicos y sabores exquisitos.",
      emoji: "🍪",
      category: 'galletas'
    }
  ];

  const handleViewProducts = () => {
    // Redirecciona a la página de productos
    navigate('/products');
  };

  const handleProductInterest = (category) => {
    // Redirecciona a la página de productos y hace scroll a la categoría específica
    navigate('/products', { 
      state: { 
        scrollToCategory: category 
      } 
    });
  };

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.homeTitle}>
          ¡Bienvenido a la Repostería "Migdalis Tortas"! 
          <span className={styles.cupcakeIcon}>🧁</span>
        </h1>
        <p className={styles.homeSubtitle}>
          Donde cada bocado es un momento de felicidad
        </p>
        <p className={styles.welcomeMessage}>
          Descubre nuestros exquisitos pasteles y postres caseros, 
          elaborados con los mejores ingredientes y mucho amor. <br /> 
          Cada creación es una obra de arte dulce que endulzará tus momentos especiales.
        </p>
        <button className={styles.ctaButton} onClick={handleViewProducts}>
          Ver Nuestros Productos
        </button>
      </section>

      {/* Featured Products Section */}
      <section className={styles.featuredSection}>
        <h2 className={styles.sectionTitle}>Postres Destacados</h2>
        <div className={styles.productsGrid}>
          {featuredProducts.map(product => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>
                {product.emoji}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                <p className={styles.productPrice}>{product.price}</p>
                <button 
                  className={styles.orderButton}
                  onClick={() => handleProductInterest(product.category)}
                >
                  ver más {product.emoji}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            Repostería Artesanal "Migdalis Tortas" - Endulzando tus momentos especiales
          </p>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Migdalis Tortas. Todos los derechos reservados.
          </p>
          <p className={styles.copyright}>
            Diseñado con 💜 para los amantes de la repostería
          </p>
        </div>
      </footer>
    </div>
  );
}