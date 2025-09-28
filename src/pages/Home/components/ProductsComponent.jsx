import { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";

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
      button.style.background = '#28a745';
      setTimeout(() => {
        button.textContent = 'Agregar al Carrito';
        button.style.background = '#8b5e3c';
      }, 1500);
    }
  };

  useEffect(() => {
    getProductsByCategory();
  }, [categoria]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Cargando productos...</div>;
  }

  if (error) {
    return <div style={{ color: "red", textAlign: 'center', padding: '20px' }}>{error}</div>;
  }

  return (
    <>
      {products.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No hay productos disponibles en esta categoría</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '25px',
          padding: '20px 0'
        }}>
          {products.map(product => (
            <div 
              key={product.id} 
              style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '12px', 
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                background: 'white',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: '#2f4f4f',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {product.name}
              </h3>
              
              <p style={{ 
                color: '#666', 
                fontSize: '14px',
                margin: '0 0 15px 0',
                flex: 1
              }}>
                {product.description}
              </p>
              
              <p style={{ 
                fontWeight: 'bold', 
                color: '#8b5e3c',
                fontSize: '16px',
                margin: '0 0 15px 0'
              }}>
                Precio: ${product.price}
              </p>
              
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover', 
                    marginBottom: '15px',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  marginBottom: '15px',
                  borderRadius: '8px'
                }}>
                  🎂 Sin imagen
                </div>
              )}
              
              {/* Controles de cantidad y botón de ordenar */}
              <div style={{ 
                marginTop: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px' 
                }}>
                  <button 
                    onClick={() => handleQuantityChange(product.id, -1)}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      border: '1px solid #ddd', 
                      background: 'white', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.borderColor = '#2f4f4f';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.borderColor = '#ddd';
                    }}
                  >
                    -
                  </button>
                  
                  <span style={{ 
                    fontWeight: 'bold', 
                    minWidth: '40px', 
                    textAlign: 'center',
                    fontSize: '16px',
                    color: '#2f4f4f'
                  }}>
                    {quantities[product.id] || 1}
                  </span>
                  
                  <button 
                    onClick={() => handleQuantityChange(product.id, 1)}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      border: '1px solid #ddd', 
                      background: 'white', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.borderColor = '#2f4f4f';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.borderColor = '#ddd';
                    }}
                  >
                    +
                  </button>
                </div>
                
                <button 
                  id={`add-to-cart-${product.id}`}
                  onClick={() => handleAddToCart(product)}
                  style={{
                    padding: '12px',
                    background: '#8b5e3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.textContent.includes('✓')) {
                      e.target.style.background = '#7a5134';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.textContent.includes('✓')) {
                      e.target.style.background = '#8b5e3c';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
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