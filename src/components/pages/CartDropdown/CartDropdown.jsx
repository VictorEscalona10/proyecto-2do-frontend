import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth";
import styles from "./CartDropdown.module.css";

export default function CartDropdown({ isOpen, onClose }) {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (!isOpen) return null;

  const handleOrder = async () => {
  try {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para realizar un pedido');
      onClose();
      window.location.href = '/login';
      return;
    }

    // Obtener información del usuario actual
    const userResponse = await fetch('http://localhost:3000/auth/me', {
      method: 'GET',
      credentials: 'include'
    });

    const userData = await userResponse.json();
    
    if (!userData.authenticated || !userData.user) {
      alert('No se pudo obtener la información del usuario');
      return;
    }

    // Preparar los datos en el formato que espera el backend
    const orderData = {
      userId: userData.user.id,
      items: items.map(item => ({
        id: Number(item.id),
        name: String(item.name),
        price: Number(parseFloat(item.price).toFixed(2)), // Asegurar que sea número con 2 decimales
        categoryId: Number(item.categoryId || item.category?.id || 1), // Asegurar categoryId como número
        count: Number(item.quantity)
      }))
    };

    console.log('Enviando orden:', orderData);
    console.log('Tipos de datos:', orderData.items.map(item => ({
      id: typeof item.id,
      price: typeof item.price,
      categoryId: typeof item.categoryId,
      count: typeof item.count
    })));

    const response = await fetch('http://localhost:3000/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
      credentials: 'include'
    });

    if (response.ok) {
      const orderResult = await response.json();
      alert(`¡Pedido realizado exitosamente! Número de orden: ${orderResult.order?.id || orderResult.orderNumber}`);
      clearCart();
      onClose();
      
      window.location.href = '/pedidos';
    } else {
      const error = await response.json();
      
      if (response.status === 401) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
        window.location.href = '/login';
      } else {
        alert(error.message || 'Error al realizar el pedido');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión. Verifica tu conexión a internet.');
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
                    window.location.href = "/login";
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
                {authLoading ? "Verificando..." : "Realizar Pedido"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}