import { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";
import styles from "./ProductsComponent.module.css";

export function ProductsComponent({ categoria }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const { addToCart } = useCart();

  const getProductsByCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `http://localhost:3000/products/search/category?name=${categoria}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const productsData = await response.json();
      setProducts(productsData);
      
      // Inicializar cantidades en 1
      const initialQuantities = {};
      productsData.forEach(product => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.log(error);
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    addToCart(product, quantity);

    
    
    // Feedback visual
    const button = document.getElementById(`add-to-cart-${product.id}`);
    if (button) {
      button.textContent = '✓ Agregado';
      button.style.background = '#d719da9a';
      setTimeout(() => {
        button.textContent = 'Agregar al Carrito';
        button.style.background = '#d719da9a';
      }, 1500);
    }
  };

  useEffect(() => {
    getProductsByCategory();
  }, [categoria]);

  if (loading) {
    return <div className={styles.loading}>Cargando productos...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <>
      {products.length === 0 ? (
        <p className={styles.empty}>No hay productos disponibles en esta categoría</p>
      ) : (
        <div className={styles.container}>
          {products.map(product => (
            <div 
              key={product.id} 
              className={styles.productCard}
            >
            
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className={styles.productImage}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  🎂 Sin imagen
                </div>
              )}

              <h3 className={styles.productName}>
                {product.name}
              </h3>

              <p className={styles.productPrice}>
                Precio: ${product.price}
              </p>
              
              {/* Controles de cantidad y botón de ordenar */}
              <div className={styles.controlsContainer}>
                <div className={styles.quantityControls}>
                  <button 
                    onClick={() => handleQuantityChange(product.id, -1)}
                    className={styles.quantityButton}
                  >
                    -
                  </button>
                  
                  <span className={styles.quantityDisplay}>
                    {quantities[product.id] || 1}
                  </span>
                  
                  <button 
                    onClick={() => handleQuantityChange(product.id, 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </button>
                </div>
                
                <button 
                  id={`add-to-cart-${product.id}`}
                  onClick={() => handleAddToCart(product)}
                  className={styles.addToCartButton}
                >
                  Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}