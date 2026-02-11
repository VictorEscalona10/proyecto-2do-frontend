import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../hooks/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import styles from "./CartDropdown.module.css";

export default function CartDropdown({ isOpen, onClose, onShowModal }) {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  // Función segura para mostrar modales
  const showModalSafe = (modalData) => {
    if (typeof onShowModal === 'function') {
      onShowModal(modalData);
    } else {
      // Fallback a alert si onShowModal no está disponible
      console.warn('onShowModal no está disponible, usando alert como fallback');
      alert(modalData.message);
    }
  };

  if (!isOpen) return null;

  const handleOrder = () => {
    try {
      if (!isAuthenticated) {
        showModalSafe({
          type: 'warning',
          message: 'Debes iniciar sesión para realizar un pedido',
          onConfirm: () => {
            onClose();
            navigate('/login');
          }
        });
        return;
      }

      // Redirigir a la página de checkout
      onClose();
      navigate('/checkout');
      
    } catch (error) {
      console.error('Error:', error);
      showModalSafe({
        type: 'error',
        message: 'Error al procesar la solicitud. Por favor intenta de nuevo.'
      });
    }
  };

  const handleIncrement = (itemId) => {
    const item = items.find((i) => i.id === itemId);
     if (item) {
     updateQuantity(itemId, item.quantity + 1);
    }
  };

  const handleDecrement = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (item && item.quantity > 1) {
      updateQuantity(itemId, item.quantity - 1);
    } else {
      removeFromCart(itemId);
    }
  };

  return (
    <div className={styles.dropdownOverlay} onClick={onClose}>
      <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Tu Carrito de Compras</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.items}>
          {items.length === 0 ? (
            <p className={styles.empty}>Tu carrito está vacío</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemCategory}>
                    {item.category?.name || item.category || "General"}
                  </span>
                  <span className={styles.itemPrice}>${item.price} c/u</span>
                  {/* Mostrar personalizaciones si existen */}
                  {item.customizations && item.customizations.length > 0 && (
                    <div className={styles.customizations}>
                      <small>Personalizaciones:</small>
                      <ul className={styles.customizationsList}>
                        {item.customizations.map((custom, index) => (
                          <li key={index} className={styles.customizationItem}>
                            {custom.name} (+${custom.price})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => handleDecrement(item.id)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button onClick={() => handleIncrement(item.id)}>+</button>
                  </div>

                  <div className={styles.itemTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  <button
                    className={styles.removeButton}
                    onClick={() => removeFromCart(item.id)}
                    title="Eliminar producto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summary}>
              <div className={styles.totalItems}>
                Total items:{" "}
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className={styles.totalPrice}>
                Total: <strong>${getTotalPrice().toFixed(2)}</strong>
              </div>
            </div>

            {!isAuthenticated && !authLoading && (
              <div className={styles.authWarning}>
                ⚠️ Debes{" "}
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    navigate("/login");
                  }}
                >
                  iniciar sesión
                </a>{" "}
                para realizar el pedido
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={styles.clearButton}
                onClick={clearCart}
                disabled={authLoading}
              >
                Vaciar Carrito
              </button>
              <button
                className={styles.orderButton}
                onClick={handleOrder}
                disabled={authLoading || !isAuthenticated}
              >
                {authLoading ? "Verificando..." : "Proceder al Pago"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}