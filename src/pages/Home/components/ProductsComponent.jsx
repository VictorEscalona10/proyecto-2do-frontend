import { useState, useEffect } from "react";


export function ProductsComponent({categoria}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (error) {
      console.log(error);
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos cuando el componente se monta
  useEffect(() => {
    getProductsByCategory();
  }, []);

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return <>

      {products.length === 0 ? (
        <p>No hay productos disponibles</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {products.map(product => (
            <div 
              key={product.id} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p style={{ fontWeight: 'bold', color: 'green' }}>
                Precio: ${product.price}
              </p>
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666'
                }}>
                  Sin imagen
                </div>
              )}
            </div>
          ))}
        </div>
      )}
  </>;
}

