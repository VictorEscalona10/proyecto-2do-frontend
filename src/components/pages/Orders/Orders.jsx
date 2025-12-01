import { useState, useEffect } from "react";
import "./Orders.Module.css";

export function OrderPage({ onShowModal }) { // Agregar onShowModal como prop
    const API_URL = import.meta.env.VITE_API_URL;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [currentUser, setCurrentUser] = useState(null);


    
    // Verificar autenticación del usuario
useEffect(() => {
    const checkAuth = async () => {
        try {
            console.log("🔐 Verificando autenticación...");
            const response = await fetch(`${API_URL}/auth/me`, {
                method: "GET",
                credentials: "include",
            });
            
            console.log("📡 Auth response status:", response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log("✅ Usuario autenticado:", data);
                if (data.authenticated && data.user) {
                    setCurrentUser(data.user);
                    getOrdersByUser(data.user.email);
                } else {
                    setError("Debes iniciar sesión para ver tus pedidos");
                    console.warn("❌ Usuario no autenticado");
                }
            } else {
                setError("Error de autenticación. Por favor, inicia sesión nuevamente.");
                console.error("❌ Error en auth/me:", response.status);
            }
        } catch (err) {
            console.error('❌ Error verificando autenticación:', err);
            setError("Error al verificar la autenticación");
        }
    };

    checkAuth();
}, [API_URL]);

    const getOrdersByUser = async (email) => {
    if (!email.trim()) {
        setError("No se pudo identificar al usuario");
        return;
    }

    try {
        setLoading(true);
        setError("");
        
        console.log("🔐 Intentando obtener órdenes para:", email);
        
        const request = await fetch(`${API_URL}/orders/user/${email}`, {
            method: "GET",
            credentials: "include", // Esto es importante para enviar cookies de sesión
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log("📡 Response status:", request.status);
        
        if (request.status === 403) {
            throw new Error("Acceso denegado. Puede que necesites iniciar sesión nuevamente.");
        }
        
        if (!request.ok) {
            throw new Error(`Error del servidor: ${request.status}`);
        }
        
        const response = await request.json();
        console.log("✅ Órdenes obtenidas:", response);
        setOrders(response);
        setExpandedOrders(new Set());
        
    } catch (error) {
        console.error("❌ Error fetching user orders:", error);
        
        if (error.message.includes("403") || error.message.includes("Acceso denegado")) {
            setError("Acceso denegado. Por favor, inicia sesión nuevamente.");
            // Opcional: redirigir al login
            //setTimeout(() => {
            //    window.location.href = '/login';
        //    }, 3000);
        } else {
            setError("No se pudieron cargar tus pedidos: " + error.message);
        }
        
        setOrders([]);
    } finally {
        setLoading(false);
    }
};

    const toggleOrder = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const toggleAllOrders = () => {
        if (expandedOrders.size === orders.length) {
            setExpandedOrders(new Set());
        } else {
            const allOrderIds = orders.map(order => order.id);
            setExpandedOrders(new Set(allOrderIds));
        }
    };

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

    const getStatusText = (status) => {
        const statusMap = {
            "PENDING": "Pendiente",
            "PROCESSED": "Procesada",
            "CANCELLED": "Cancelada"
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        const statusClassMap = {
            "PENDING": "status-pending",
            "PROCESSED": "status-processed",
            "CANCELLED": "status-cancelled"
        };
        return statusClassMap[status] || "status-pending";
    };

    const getTotalItems = (orderDetails) => {
        return orderDetails.reduce((total, item) => total + item.quantity, 0);
    };

    const refreshOrders = () => {
        if (currentUser) {
            getOrdersByUser(currentUser.email);
        }
    };

    if (!currentUser && !loading) {
        return (
            <div className="order-page user-orders">
                <div className="auth-required">
                    <div className="auth-icon">🔒</div>
                    <h2>Inicia sesión para ver tus pedidos</h2>
                    <p>Necesitas estar autenticado para acceder a esta sección</p>
                    <button 
                        onClick={() => window.location.href = '/login'}
                        className="login-redirect-btn"
                    >
                        🚀 Ir a Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-page user-orders">
            <div className="user-orders-header">
                <h1>🎁 Mis Pedidos</h1>
                <p className="user-welcome">
                    Hola, <strong>{currentUser?.name || currentUser?.username || 'Usuario'}</strong>
                </p>
                <p className="page-description">
                    Aquí puedes ver el historial y estado de todos tus pedidos
                </p>
            </div>
            
            <div className="orders-controls">
                <button 
                    onClick={refreshOrders}
                    disabled={loading}
                    className="refresh-btn"
                >
                    {loading ? "⏳ Actualizando..." : "🔄 Actualizar"}
                </button>
                
                {orders.length > 0 && (
                    <button 
                        onClick={toggleAllOrders}
                        className="toggle-all-btn"
                    >
                        {expandedOrders.size === orders.length ? "🙈 Contraer Todas" : "👁️ Expandir Todas"}
                    </button>
                )}
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Cargando tus pedidos...</p>
                </div>
            )}

            {!loading && orders.length === 0 && !error && (
                <div className="no-orders">
                    <div className="no-orders-icon">📭</div>
                    <h3>No tienes pedidos aún</h3>
                    <p>¡Realiza tu primer pedido y aparecerá aquí!</p>
                    <button 
                        onClick={() => window.location.href = '/products'}
                        className="shop-now-btn"
                    >
                        🛒 Ir a Comprar
                    </button>
                </div>
            )}

            {!loading && orders.length > 0 && (
                <div className="orders-list">
                    <div className="orders-summary">
                        <h2>Tus Pedidos ({orders.length})</h2>
                        <p className="orders-description">
                            Pedidos ordenados por fecha (más recientes primero)
                        </p>
                    </div>

                    {orders.map((order) => {
                        const isExpanded = expandedOrders.has(order.id);
                        
                        return (
                            <div 
                                key={order.id} 
                                className={`order-card ${isExpanded ? 'expanded' : 'collapsed'}`}
                                onClick={() => toggleOrder(order.id)}
                            >
                                <div className="order-header-compact">
                                    <div className="order-basic-info">
                                        <h3 className="order-title">Pedido #{order.id}</h3>
                                        <div className="order-status-badge">
                                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="order-summary-compact">
                                        <span className="order-total-compact">
                                            ${order.total.toFixed(2)}
                                        </span>
                                        <span className="order-date-compact">
                                            {formatDate(order.orderDate)}
                                        </span>
                                        <span className="order-items-count">
                                            {getTotalItems(order.orderDetails)} productos
                                        </span>
                                        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                                            {isExpanded ? '▼' : '▶'}
                                        </span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="order-expandable-content" onClick={(e) => e.stopPropagation()}>
                                        <div className="order-info-section">
                                            <h4>📋 Detalles del Pedido</h4>
                                            <div className="order-details-grid">
                                                <div className="order-info-item">
                                                    <strong>📅 Fecha:</strong> 
                                                    <span>{formatDate(order.orderDate)}</span>
                                                </div>
                                                <div className="order-info-item">
                                                    <strong>🎯 Estado:</strong> 
                                                    <span className={`status-text ${getStatusClass(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                </div>
                                                <div className="order-info-item">
                                                    <strong>💰 Total:</strong> 
                                                    <span className="total-amount">${order.total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="order-details-section">
                                            <h4>🛍️ Productos ({getTotalItems(order.orderDetails)})</h4>
                                            <div className="order-details">
                                                {order.orderDetails.map((detail) => (
                                                    <div key={detail.id} className="order-item">
                                                        <div className="item-image">
                                                            {detail.product.imageUrl ? (
                                                                <img 
                                                                    src={detail.product.imageUrl} 
                                                                    alt={detail.product.name}
                                                                />
                                                            ) : (
                                                                <div className="image-placeholder">🎂</div>
                                                            )}
                                                        </div>
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
                                                                {detail.quantity} x ${detail.unitPrice.toFixed(2)}
                                                            </p>
                                                            <p className="item-total">
                                                                ${(detail.quantity * detail.unitPrice).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="order-actions">
                                            <p className="order-help">
                                                💡 ¿Tienes preguntas sobre tu pedido? 
                                                <a href="/contact" className="contact-link"> Contáctanos</a>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}