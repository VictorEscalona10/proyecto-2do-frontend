import styles from './Products.module.css';
import { ProductsComponent } from "../ProductsComponent/ProductsComponent.jsx";
import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Products() {
  const location = useLocation();
  
  // Refs para cada sección de categoría
  const tortasRef = useRef(null);
  const galletasRef = useRef(null);
  const donasRef = useRef(null);
  const ponquesRef = useRef(null);
  const pasapalosDulcesRef = useRef(null);
  const pasapalosSaladosRef = useRef(null);

  // Mapeo de categorías a refs
  const categoryRefs = {
    'tortas': tortasRef,
    'galletas': galletasRef,
    'donas': donasRef,
    'ponques': ponquesRef,
    'pasapalos dulces': pasapalosDulcesRef,
    'pasapalos salados': pasapalosSaladosRef
  };

  // Función para hacer scroll suave a una categoría
  const scrollToCategory = (category) => {
    const ref = categoryRefs[category];
    if (ref && ref.current) {
      setTimeout(() => {
        ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  // Efecto para manejar el scroll automático cuando viene del home
  useEffect(() => {
    if (location.state && location.state.scrollToCategory) {
      scrollToCategory(location.state.scrollToCategory);
    }
  }, [location.state]);

  // Mapeo de emojis a categorías
  const emojiCategories = [
    { emoji: '🎂', label: 'Tortas', ref: tortasRef },
    { emoji: '🍪', label: 'Galletas', ref: galletasRef },
    { emoji: '🍩', label: 'Donas', ref: donasRef },
    { emoji: '🍰', label: 'Ponques', ref: ponquesRef },
    { emoji: '🧁', label: 'Pasapalos Dulces', ref: pasapalosDulcesRef },
    { emoji: '🥨', label: 'Pasapalos Salados', ref: pasapalosSaladosRef }
  ];

  const handleEmojiClick = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className={styles.productsContainer}>
      <h1 className={styles.productsTitle}>¡Bienvenido a la sección de Productos!</h1>
      <p className={styles.productsSubtitle}>Aquí encontrarás todos nuestros deliciosos productos</p>
      
      <div className={styles.welcomeMessage}>
        <p>Haz clic en cualquier emoji para ir directamente a esa categoría:</p>

        <div className={styles.emojiContainer}>
          {emojiCategories.map((item, index) => (
            <button
              key={index}
              className={styles.emojiButton}
              onClick={() => handleEmojiClick(item.ref)}
              title={`Ir a ${item.label}`}
              aria-label={`Ir a la categoría ${item.label}`}
            >
              {item.emoji}
            </button>
          ))}
        </div>

        <div className={styles.Productscont}>
          <h1 className={styles.productos}>Productos</h1>
          
          {/* Sección de Tortas */}
          <div ref={tortasRef} className={styles.categorySection}>
            <h2 className={styles.categoria}>Tortas</h2>
            <ProductsComponent categoria='tortas'/>
          </div>

          {/* Sección de Galletas */}
          <div ref={galletasRef} className={styles.categorySection}>
            <h2 className={styles.categoria}>Galletas</h2>
            <ProductsComponent categoria='galletas'/>
          </div>

          {/* Sección de Donas */}
          <div ref={donasRef} className={styles.categorySection}>
            <h2 className={styles.categoria}>Donas</h2>
            <ProductsComponent categoria='donas'/>
          </div>

          {/* Sección de Ponques */}
          <div ref={ponquesRef} className={styles.categorySection}>
            <h2 className={styles.categoria}>Ponques</h2>
            <ProductsComponent categoria='ponques'/>
          </div>

          {/* Sección de Pasapalos Dulces */}
          <div ref={pasapalosDulcesRef} className={styles.categorySection}>
            <h2 className={styles.categoria}>Pasapalos Dulces</h2>
            <ProductsComponent categoria='pasapalos dulces'/>
          </div>

          {/* Sección de Pasapalos Salados */}
          <div ref={pasapalosSaladosRef} className={styles.categorySection}>
            <h2 className={styles.categoria}>Pasapalos Salados</h2>
            <ProductsComponent categoria='pasapalos salados'/>
          </div>
        </div>
      </div>
    </div>
  );
}