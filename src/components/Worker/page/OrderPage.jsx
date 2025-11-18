import { useState } from "react";
import "./OrderPage.css";

export function OrderPage() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [userEmail, setUserEmail] = useState("victorescalona2006@gmail.com");
    const [hasSearched, setHasSearched] = useState(false);

    const getOrdersByUser = async (email) => {
        if (!email.trim()) {
            setError("Por favor ingresa un email válido");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const request = await fetch(`${API_URL}/orders/user/${email}`, {
                method: "GET",
                credentials: "include",
            });
            
            if (!request.ok) {
                throw new Error(`Error: ${request.status}`);
            }
            
            const response = await request.json();
            setOrders(response);
            setHasSearched(true);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError("No se pudieron cargar las órdenes");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus, userName) => {
        try {
            setLoading(true);
            const updateData = {
                id: orderId,
                name: userName,
                status: newStatus
            };

            const request = await fetch(`${API_URL}/orders/update`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData)
            });

            if (!request.ok) {
                throw new Error(`Error: ${request.status}`);
            }

            const response = await request.json();
            
            // Actualizar el estado local
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                        ? { ...order, status: newStatus }
                        : order
                )
            );
            
            console.log("Estado actualizado:", response);
        } catch (error) {
            console.error("Error updating order status:", error);
            setError("No se pudo actualizar el estado de la orden");
        } finally {
            setLoading(false);
        }
    };

    // Función para formatear la fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Función para traducir el estado
    const getStatusText = (status) => {
        const statusMap = {
            "PENDING": "Pendiente",
            "PROCESSED": "Procesada",
            "CANCELLED": "Cancelada"
        };
        return statusMap[status] || status;
    };

    // Función para obtener la clase CSS del estado
    const getStatusClass = (status) => {
        const statusClassMap = {
            "PENDING": "status-pending",
            "PROCESSED": "status-processed",
            "CANCELLED": "status-cancelled"
        };
        return statusClassMap[status] || "status-pending";
    };

    // Función para calcular el total de productos en una orden
    const getTotalItems = (orderDetails) => {
        return orderDetails.reduce((total, item) => total + item.quantity, 0);
    };

    // Función para manejar la búsqueda al presionar Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            getOrdersByUser(userEmail);
        }
    };

    return (
        <div className="order-page">
            <h1>🍰 Gestión de Órdenes</h1>
            
            {/* Panel de búsqueda */}
            <div className="search-panel">
                <h3>🔍 Buscar Órdenes por Email</h3>
                <div className="search-input-group">
                    <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ingresa el email del usuario"
                    />
                    <button 
                        onClick={() => getOrdersByUser(userEmail)}
                        disabled={loading}
                        className="search-btn"
                    >
                        {loading ? "⏳ Buscando..." : "🔍 Buscar Órdenes"}
                    </button>
                </div>
                {!hasSearched && (
                    <p className="search-description">
                        Ingresa un email y presiona el botón para buscar las órdenes
                    </p>
                )}
            </div>

            {/* Mensajes de estado */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Estado inicial - sin búsqueda */}
            {!hasSearched && !loading && (
                <div className="empty-state">
                    <h3>📭 No se ha realizado ninguna búsqueda</h3>
                    <p>Ingresa un email arriba y presiona "Buscar Órdenes" para ver las órdenes del usuario.</p>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="loading-state">
                    <p>⏳ Buscando órdenes...</p>
                </div>
            )}

            {/* Sin resultados */}
            {hasSearched && !loading && orders.length === 0 && !error && (
                <div className="no-results">
                    <h3>📭 No se encontraron órdenes</h3>
                    <p>No hay órdenes registradas para el email: <strong>{userEmail}</strong></p>
                </div>
            )}

            {/* Lista de órdenes */}
            {hasSearched && orders.length > 0 && (
                <div className="orders-list">
                    <div className="orders-header">
                        <h2>
                            📋 Órdenes Encontradas: <span className="results-count">{orders.length}</span>
                        </h2>
                        <p className="user-email">
                            📧 Email: {userEmail}
                        </p>
                    </div>

                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            {/* Header de la orden */}
                            <div className="order-header">
                                <div className="order-info">
                                    <h3>🛒 Orden #{order.id}</h3>
                                    <p className="order-meta">
                                        <strong>📅 Fecha:</strong> {formatDate(order.orderDate)}
                                    </p>
                                    <p className="order-meta">
                                        <strong>👤 Cliente:</strong> {order.user.name}
                                    </p>
                                </div>
                                
                                <div className="order-summary">
                                    <p className="order-total">
                                        💰 Total: ${order.total}
                                    </p>
                                    <div className="status-control">
                                        <label htmlFor={`status-${order.id}`}>
                                            Cambiar Estado:
                                        </label>
                                        <select
                                            id={`status-${order.id}`}
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value, order.user.name)}
                                            disabled={loading}
                                        >
                                            <option value="PENDING">Pendiente</option>
                                            <option value="PROCESSED">Procesada</option>
                                            <option value="CANCELLED">Cancelada</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Estado actual */}
                            <div className="status-badge-container">
                                <span className={`status-badge ${getStatusClass(order.status)}`}>
                                    📊 Estado actual: {getStatusText(order.status)}
                                </span>
                            </div>

                            {/* Detalles de la orden */}
                            <div className="order-details-section">
                                <h4>
                                    🎁 Productos ({getTotalItems(order.orderDetails)} items)
                                </h4>
                                <div className="order-details">
                                    {order.orderDetails.map((detail) => (
                                        <div key={detail.id} className="order-item">
                                            <div className="item-info">
                                                <p className="item-name">
                                                    {detail.product.name}
                                                </p>
                                                <p className="item-description">
                                                    {detail.product.description}
                                                </p>
                                            </div>
                                            <div className="item-pricing">
                                                <p className="item-quantity">
                                                    {detail.quantity} x ${detail.unitPrice}
                                                </p>
                                                <p className="item-total">
                                                    ${(detail.quantity * detail.unitPrice).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}