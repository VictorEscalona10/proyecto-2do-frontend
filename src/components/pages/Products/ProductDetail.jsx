import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductDetail.module.css';
import { useCart } from "../../../context/CartContext";

// Componente Modal (copiado de ProductPage)
const Modal = ({ show, type, message, onConfirm, onClose, autoHide }) => {
  if (!show) return null;

  const getModalTitle = () => {
    switch (type) {
      case 'success': return '✅ Operación Exitosa';
      case 'error': return '❌ Error';
      case 'warning': return '⚠️ Advertencia';
      case 'confirm': return '❓ Confirmación';
      default: return 'Mensaje del Sistema';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content ${autoHide ? 'modal-auto-hide' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-header ${type}`}>
          <h3>{getModalTitle()}</h3>
          {!autoHide && (
            <button className="close-btn" onClick={onClose}>×</button>
          )}
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        {!autoHide && (
          <div className="modal-footer">
            {type === 'confirm' ? (
              <>
                <button 
                  className="modal-btn confirm-btn"
                  onClick={() => {
                    onConfirm?.();
                    onClose();
                  }}
                >
                  ✅ Sí
                </button>
                <button 
                  className="modal-btn cancel-btn"
                  onClick={onClose}
                >
                  ❌ No
                </button>
              </>
            ) : (
              <button 
                className="modal-btn ok-btn"
                onClick={onClose}
              >
                Aceptar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export function ProductDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { addToCart } = useCart();
  
  // Estado para la cantidad del producto
  const [quantity, setQuantity] = useState(1);
  
  // Estado para el modal de notificaciones
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    type: 'info',
    message: '',
    onConfirm: null,
    autoHide: false
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Verificar autenticación del usuario
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
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

  // Calcular rating promedio
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Función para mostrar modales
  const showModal = (modalConfig) => {
    setNotificationModal({
      show: true,
      type: modalConfig.type || 'info',
      message: modalConfig.message,
      onConfirm: modalConfig.onConfirm,
      autoHide: modalConfig.autoHide || false
    });

    // Auto-hide después de 2 segundos si está configurado
    if (modalConfig.autoHide) {
      setTimeout(() => {
        closeNotificationModal();
      }, 2000);
    }
  };

  const closeNotificationModal = () => {
    setNotificationModal({
      show: false,
      type: 'info',
      message: '',
      onConfirm: null,
      autoHide: false
    });
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Usar la función addToCart del contexto con la cantidad especificada
    addToCart(product, quantity);
    
    // Feedback visual
    const button = document.querySelector(`.${styles.addToCartButton}`);
    if (button) {
      const originalText = button.textContent;
      const originalBackground = button.style.background;
      
      button.textContent = '✓ Agregado';
      button.style.background = '#d719da9a';
      
      setTimeout(() => {
        button.textContent = '🛒 Agregar al Carrito';
        button.style.background = '';
      }, 1500);
    }
  
    console.log(`Producto agregado al carrito: ${product.name}, Cantidad: ${quantity}`);
    
    // No mostrar modal/notificación para agregar al carrito según lo solicitado
  };

  // Manejar envío de reseña
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      showModal({
        type: 'warning',
        message: '⚠️ Por favor selecciona una calificación',
        autoHide: true
      });
      return;
    }

    if (!product) {
      showModal({
        type: 'error',
        message: '❌ Error: Producto no disponible',
        autoHide: true
      });
      return;
    }

    if (!currentUser) {
      showModal({
        type: 'warning',
        message: '🔒 Debes iniciar sesión para enviar una reseña',
        autoHide: true
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        userId: currentUser.id,
        productId: product.id,
        rating: rating,
        comment: comment
      };

      const response = await fetch(`${API_URL}/reviews/create`, {
        method: 'POST',
        credentials: 'include',
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
        
        // Mostrar modal de éxito con nombre de usuario
        showModal({
          type: 'success',
          message: `✅ Reseña enviada exitosamente por ${currentUser.username || currentUser.name || 'usuario'}`,
          autoHide: true
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la reseña');
      }
    } catch (err) {
      console.error('Error completo:', err);
      showModal({
        type: 'error',
        message: `❌ Error al enviar la reseña: ${err.message}`,
        autoHide: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Renderizar estrellas para el formulario
  const renderStarRating = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`${styles.starButton} ${
          star <= (hoverRating || rating) ? styles.filled : ''
        }`}
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
      >
        ★
      </button>
    ));
  };

  // Renderizar estrellas para display
  const renderDisplayStars = (ratingValue) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`${styles.displayStar} ${
          star <= ratingValue ? styles.filled : ''
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>❌</div>
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/products')}
        >
          ← Volver a productos
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>📦</div>
        <h3>Producto no encontrado</h3>
        <p>El producto que buscas no está disponible.</p>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/products')}
        >
          ← Volver a productos
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header de navegación */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/products')}
          >
            ← Volver a Productos
          </button>
          <h1>Detalles del Producto</h1>
          <div className={styles.navSpacer}></div>
        </nav>
      </header>

      <main className={styles.main}>
        {/* Sección principal del producto */}
        <section className={styles.productSection}>
          <div className={styles.productCard}>
            <div className={styles.productImage}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <div className={styles.placeholderImage}>
                  <span>🖼️ Imagen no disponible</span>
                </div>
              )}
            </div>
            
            <div className={styles.productDetails}>
              <div className={styles.productHeader}>
                <h1 className={styles.productTitle}>{product.name}</h1>
                <div className={styles.priceTag}>${product.price}</div>
              </div>
              
              <div className={styles.ratingSummary}>
                <div className={styles.stars}>
                  {renderDisplayStars(Math.round(averageRating))}
                </div>
                <span className={styles.ratingText}>
                  {averageRating > 0 ? averageRating.toFixed(1) : 'Sin'} calificaciones
                </span>
                <span className={styles.reviewCount}>({reviews.length} reseñas)</span>
              </div>

              <div className={styles.category}>
                <strong>Categoría:</strong> {product.category?.name || 'Sin categoría'}
              </div>

              <div className={styles.description}>
                <h3>Descripción</h3>
                <p>{product.description || 'Este producto no tiene descripción disponible.'}</p>
              </div>

              {/* Controles de cantidad y botón de agregar al carrito */}
              <div className={styles.cartControls}>
                <div className={styles.quantityControls}>
                  <span className={styles.quantityLabel}>Cantidad:</span>
                  <div className={styles.quantityButtons}>
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      className={styles.quantityButton}
                    >
                      -
                    </button>
                    
                    <span className={styles.quantityDisplay}>
                      {quantity}
                    </span>
                    
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      className={styles.quantityButton}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <button 
                  className={styles.addToCartButton}
                  onClick={handleAddToCart}
                >
                  🛒 Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de valoraciones y comentarios */}
        <section className={styles.reviewsSection}>
          <div className={styles.sectionHeader}>
            <h2>⭐ Valoraciones y Comentarios</h2>
            <div className={styles.ratingOverview}>
              <div className={styles.averageRating}>
                <span className={styles.averageNumber}>{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</span>
                <div className={styles.averageStars}>
                  {renderDisplayStars(Math.round(averageRating))}
                </div>
                <span>{reviews.length} reseñas</span>
              </div>
            </div>
          </div>

          {/* Formulario de reseña */}
          {currentUser ? (
            <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
              <h3>Deja tu reseña</h3>
              
              <div className={styles.ratingInput}>
                <label>Tu calificación:</label>
                <div className={styles.starRating}>
                  {renderStarRating()}
                  <span className={styles.ratingText}>
                    {rating > 0 ? `${rating} estrella${rating !== 1 ? 's' : ''}` : 'Selecciona rating'}
                  </span>
                </div>
              </div>
              
              <div className={styles.commentInput}>
                <label htmlFor="comment">Tu comentario:</label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="4"
                  placeholder="Comparte tu experiencia con este producto..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={submitting || rating === 0}
              >
                {submitting ? '⏳ Enviando...' : '📤 Enviar Reseña'}
              </button>
            </form>
          ) : (
            <div className={styles.loginPrompt}>
              <p>🔒 Debes <a href="/login" className={styles.loginLink}>iniciar sesión</a> para dejar una reseña.</p>
            </div>
          )}
          
          {/* Lista de reseñas */}
          <div className={styles.reviewsList}>
            <h3>Comentarios de clientes</h3>
            
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.userInfo}>
                      <span className={styles.userAvatar}>👤</span>
                      <span className={styles.userName}>
                        {review.user?.username || 'Usuario Anónimo'}
                      </span>
                    </div>
                    <div className={styles.reviewRating}>
                      {renderDisplayStars(review.rating)}
                      <span className={styles.ratingValue}>({review.rating})</span>
                    </div>
                  </div>
                  
                  <p className={styles.reviewComment}>{review.comment}</p>
                  
                  <div className={styles.reviewDate}>
                    {new Date(review.createdAt || Date.now()).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noReviews}>
                <div className={styles.noReviewsIcon}>💬</div>
                <p>Aún no hay comentarios para este producto.</p>
                <p>¡Sé el primero en dejar una reseña!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modal de notificaciones */}
      <Modal
        show={notificationModal.show}
        type={notificationModal.type}
        message={notificationModal.message}
        onConfirm={notificationModal.onConfirm}
        onClose={closeNotificationModal}
        autoHide={notificationModal.autoHide}
      />
    </div>
  );
}