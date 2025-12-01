import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductDetail.module.css';

export function ProductDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Verificar autenticación del usuario
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include', // Esto es crucial para enviar cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.error('Error verificando autenticación:', err);
      }
    };

    checkAuth();
  }, []);

  // Obtener detalles del producto
  useEffect(() => {
    const fetchProduct = async () => {
      if (!name) {
        setError('Nombre del producto no especificado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/products/search/name?name=${encodeURIComponent(name)}`);
        if (!response.ok) {
          throw new Error('Producto no encontrado');
        }
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const productData = data.data[0];
          setProduct(productData);
        } else {
          throw new Error('Producto no encontrado');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [name]);

  // Obtener reseñas del producto
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product || !product.id) return;

      try {
        const response = await fetch(`${API_URL}/reviews/product/${product.id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data || []);
        } else {
          console.error('Error al cargar reseñas');
        }
      } catch (err) {
        console.error('Error al cargar reseñas:', err);
      }
    };

    if (product) {
      fetchReviews();
    }
  }, [product]);

  // Manejar envío de reseña - CORREGIDO para usar cookies
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    if (!product) {
      alert('Error: Producto no disponible');
      return;
    }

    // Verificar que el usuario esté autenticado
    if (!currentUser) {
      alert('Debes iniciar sesión para enviar una reseña');
      navigate('/login'); // Redirigir al login
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        userId: currentUser.id, // Usar el ID del usuario autenticado
        productId: product.id,
        rating: rating,
        comment: comment
      };

      console.log('Enviando reseña:', reviewData);

      const response = await fetch(`${API_URL}/reviews/create`, {
        method: 'POST',
        credentials: 'include', // Esto envía las cookies automáticamente
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        const newReview = await response.json();
        
        // Recargar las reseñas
        const reviewsResponse = await fetch(`${API_URL}/reviews/product/${product.id}`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData || []);
        }
        
        // Resetear formulario
        setRating(0);
        setComment('');
        alert('Reseña enviada exitosamente');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la reseña');
      }
    } catch (err) {
      console.error('Error completo:', err);
      alert('Error al enviar la reseña: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando producto...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={() => navigate('/products')}>Volver a productos</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.error}>
        <p>Producto no encontrado</p>
        <button onClick={() => navigate('/products')}>Volver a productos</button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.main}>
        <section className={styles.productDetail}>
          <div className={styles.productInfo}>
            <div className={styles.productImage}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <div className={styles.placeholderImage}>
                  <span>Imagen no disponible</span>
                </div>
              )}
            </div>
            <div className={styles.productText}>
              <h1>{product.name}</h1>
              <p><strong>Precio:</strong> ${product.price}</p>
              <p><strong>Categoría:</strong> {product.category?.name}</p>
              
              <div className={styles.productDescription}>
                <h2>Descripción</h2>
                <p>{product.description}</p>
              </div>
              
              <button 
                className={styles.addToCartButton}
                onClick={() => alert('Funcionalidad de agregar al carrito en desarrollo')}
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </section>

        <section className={styles.ratingComments}>
          <h2>Valoración y Comentarios</h2>
          
          {currentUser ? (
            <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
              <div className={styles.rating}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star}>
                    <input 
                      type="radio" 
                      id={`star${star}`}
                      name="rating" 
                      value={star} 
                      checked={rating === star}
                      onChange={() => setRating(star)}
                    />
                    <label htmlFor={`star${star}`} title={`${star} estrellas`}>★</label>
                  </div>
                ))}
              </div>
              
              <div className={styles.commentInput}>
                <label htmlFor="comment">Comentario:</label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="4"
                  placeholder="Escribe tu comentario aquí"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <button type="submit" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Valoración'}
              </button>
            </form>
          ) : (
            <p>Debes <a href="/login">iniciar sesión</a> para dejar una reseña.</p>
          )}
          
          <div className={styles.commentsList}>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{review.user?.username || 'Usuario'}</span>
                    <div className={styles.commentRating}>
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`${styles.star} ${i < review.rating ? styles.filled : ''}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className={styles.commentText}>{review.comment}</p>
                </div>
              ))
            ) : (
              <p className={styles.noComments}>Aún no hay comentarios para este producto.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}