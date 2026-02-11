import React, { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import "./CheckoutPage.css";

export function CheckoutPage({ onShowModal }) {
  const { items, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");
  const [reference, setReference] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Función para mostrar modales
  const showModal = (message, type = "info", onConfirm = null) => {
    if (typeof onShowModal === "function") {
      onShowModal({ type, message, onConfirm });
    } else {
      // Fallback: usar nuestro propio modal simple
      if (type === "success") {
        setSuccessMessage(message);
        setShowSuccessModal(true);
        if (onConfirm) {
          setTimeout(() => {
            onConfirm();
          }, 3000);
        }
      } else if (type === "confirm" && onConfirm) {
        if (window.confirm(message)) {
          onConfirm();
        }
      } else {
        alert(message);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.match("image.*")) {
      setError("Por favor, sube solo imágenes (JPG, PNG, etc.)");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen es muy grande. Máximo 5MB");
      return;
    }

    setProofImage(file);
    setError("");
  };

  const validateForm = () => {
    if (paymentMethod !== "EFECTIVO") {
      if (!reference.trim()) {
        setError("Por favor ingresa el número de referencia");
        return false;
      }
      // Validar que sean exactamente 4 dígitos
      if (!/^\d{4}$/.test(reference)) {
        setError("La referencia debe contener exactamente 4 dígitos");
        return false;
      }
      if (!proofImage) {
        setError("Por favor sube el comprobante de pago");
        return false;
      }
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      // 1. Crear la orden SIN la imagen
      const orderData = {
        userId: user.id,
        items: items.map((item) => ({
          id: Number(item.id),
          count: Number(item.quantity),
          price: Number(parseFloat(item.price).toFixed(2)),
          customizations: item.customizations || null,
        })),
        paymentMethod,
        reference: paymentMethod !== "EFECTIVO" ? reference : undefined,
      };

      console.log("Creando orden:", orderData);

      // 2. Crear la orden
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
        credentials: "include",
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || "Error al crear la orden");
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.order?.id;

      if (!orderId) {
        throw new Error("No se recibió el ID de la orden");
      }

      // 3. Si el método no es efectivo, subir la imagen por separado
      if (paymentMethod !== "EFECTIVO" && proofImage) {
        setUploadingProof(true);
        const formData = new FormData();
        formData.append("file", proofImage);

        const proofResponse = await fetch(
          `${API_URL}/orders/${orderId}/payment-proof`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          },
        );

        if (!proofResponse.ok) {
          const errorData = await proofResponse.text();
          console.error("Error subiendo comprobante:", errorData);
          throw new Error("Error al subir el comprobante de pago");
        }
        setUploadingProof(false);
      }

      // Éxito
      showModal(
        `¡Pedido realizado exitosamente! Número de orden: #${orderId}. Revisa tu email para el comprobante.`,
        "success",
        () => {
          clearCart();
          navigate("/pedidos");
        },
      );
    } catch (error) {
      console.error("Error:", error);
      setError(
        error.message ||
          "Error al procesar la orden. Por favor intenta de nuevo.",
      );
    } finally {
      setLoading(false);
      setUploadingProof(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    clearCart();
    navigate("/pedidos");
  };

  if (authLoading) {
    return (
      <div className="checkout-loading">
        <div className="loading-spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-cart-checkout">
        <h2>Tu carrito está vacío</h2>
        <p>Agrega productos antes de proceder al checkout</p>
        <button
          onClick={() => navigate("/products")}
          className="continue-shopping-btn"
        >
          Continuar Comprando
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header success">
              <h3>✅ Éxito</h3>
              <button className="close-btn" onClick={closeSuccessModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>{successMessage}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn ok-btn" onClick={closeSuccessModal}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="checkout-container">
        <div className="checkout-header">
          <h1>🚀 Finalizar Compra</h1>
          <p>Completa los datos para procesar tu pedido</p>
        </div>

        <div className="checkout-content">
          {/* Resumen del Pedido */}
          <div className="order-summary-section">
            <h2>📦 Resumen del Pedido</h2>
            <div className="order-items-list">
              {items.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <div className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total-checkout">
              <span>Total:</span>
              <span className="total-amount">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Método de Pago */}
          <div className="payment-method-section">
            <h2>💳 Método de Pago</h2>

            <div className="payment-options">
              <div className="payment-option">
                <input
                  type="radio"
                  id="efectivo"
                  name="paymentMethod"
                  value="EFECTIVO"
                  checked={paymentMethod === "EFECTIVO"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label htmlFor="efectivo">
                  <span className="option-title">💵 Efectivo</span>
                  <span className="option-desc">
                    Paga al momento de recibir tu pedido
                  </span>
                </label>
              </div>

              <div className="payment-option">
                <input
                  type="radio"
                  id="pagomovil"
                  name="paymentMethod"
                  value="PAGOMOVIL"
                  checked={paymentMethod === "PAGOMOVIL"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label htmlFor="pagomovil">
                  <span className="option-title">📱 Pago Móvil</span>
                  <span className="option-desc">
                    Transferencia por teléfono
                  </span>
                </label>
              </div>

              <div className="payment-option">
                <input
                  type="radio"
                  id="transferencia"
                  name="paymentMethod"
                  value="TRANSFERENCIA"
                  checked={paymentMethod === "TRANSFERENCIA"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label htmlFor="transferencia">
                  <span className="option-title">🏦 Transferencia</span>
                  <span className="option-desc">Transferencia bancaria</span>
                </label>
              </div>
            </div>

            {/* Campos condicionales para pagos electrónicos */}
            {paymentMethod !== "EFECTIVO" && (
              <div className="electronic-payment-details">
                <div className="form-group">
                  <label htmlFor="reference">🔢 Número de Referencia *</label>
                  <input
                    type="text"
                    id="reference"
                    value={reference}
                    onChange={(e) => {
                      // Solo permite números y limita a 4 dígitos
                      const value = e.target.value.replace(/\D/g, ""); // Elimina todo lo que no sea dígito
                      if (value.length <= 4) {
                        setReference(value);
                      }
                    }}
                    onKeyPress={(e) => {
                      // Solo permite números
                      if (!/\d/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Últimos 4 dígitos de la referencia (ej: 1234)"
                    className="reference-input"
                    maxLength={4}
                    pattern="\d{4}"
                    inputMode="numeric"
                  />
                  <small className="input-help">
                    Ingresa solo los últimos 4 dígitos numéricos de tu
                    referencia de pago
                    {reference && (
                      <span className="digit-count">
                        {" "}
                        ({reference.length}/4)
                      </span>
                    )}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="proof">📸 Comprobante de Pago *</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="proof"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    <label htmlFor="proof" className="file-upload-label">
                      {proofImage
                        ? "📁 Cambiar imagen"
                        : "📁 Subir comprobante"}
                    </label>
                    {proofImage && (
                      <div className="image-preview">
                        <img
                          src={URL.createObjectURL(proofImage)}
                          alt="Vista previa"
                          className="preview-image"
                        />
                        <div className="image-info">
                          <span className="image-name">{proofImage.name}</span>
                          <span className="image-size">
                            {(proofImage.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    )}
                    <small className="input-help">
                      Sube una imagen clara del comprobante (máximo 5MB)
                    </small>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "EFECTIVO" && (
              <div className="cash-instructions">
                <div className="info-box">
                  <p>
                    💡 <strong>Instrucciones para pago en efectivo:</strong>
                  </p>
                  <ul>
                    <li>Pagarás al momento de recibir tu pedido</li>
                    <li>Ten el monto exacto disponible</li>
                    <li>Recibirás tu comprobante físico</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Información del Cliente */}
          <div className="customer-info-section">
            <h2>👤 Información del Cliente</h2>
            <div className="customer-details">
              <div className="info-row">
                <span className="info-label">Nombre:</span>
                <span className="info-value">
                  {user?.name || "No disponible"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">
                  {user?.email || "No disponible"}
                </span>
              </div>
              {user?.Identification && (
                <div className="info-row">
                  <span className="info-label">Cédula:</span>
                  <span className="info-value">{user.Identification}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="checkout-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
          </div>
        )}

        {/* Acciones */}
        <div className="checkout-actions">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
            disabled={loading || uploadingProof}
          >
            ↩️ Volver
          </button>

          <button
            onClick={handleSubmitOrder}
            disabled={
              loading ||
              uploadingProof ||
              (paymentMethod !== "EFECTIVO" &&
                (!reference || reference.length !== 4 || !proofImage))
            }
            className="submit-order-button"
          >
            {loading || uploadingProof
              ? "⏳ Procesando..."
              : "✅ Confirmar Pedido"}
          </button>
        </div>

        {/* Nota Informativa */}
        <div className="checkout-note">
          <p>
            📝 <strong>Nota:</strong> Recibirás un email con el comprobante de
            tu orden y los detalles del pago.
          </p>
          <p>
            Para pagos electrónicos, tu orden será procesada una vez
            verifiquemos el comprobante.
          </p>
          {uploadingProof && (
            <p className="uploading-note">
              <small>⏳ Subiendo comprobante de pago...</small>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
