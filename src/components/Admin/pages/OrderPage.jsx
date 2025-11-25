import { useState, useEffect } from "react";
import "./OrderPage.css";

export function OrderPage() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState("email"); // 'email' o 'identification'
    const [hasSearched, setHasSearched] = useState(false);
    const [showAllOrders, setShowAllOrders] = useState(false);

    // Cargar todas las órdenes al montar el componente
    useEffect(() => {
        getAllOrders();
    }, []);

    const getAllOrders = async () => {
        try {
            setLoading(true);
            setError("");
            const request = await fetch(`${API_URL}/orders`, {
                method: "GET",
                credentials: "include",
            });
            
            if (!request.ok) {
                throw new Error(`Error: ${request.status}`);
            }
            
            const response = await request.json();
            setOrders(response);
            setShowAllOrders(true);
            setHasSearched(true);
        } catch (error) {
            console.error("Error fetching all orders:", error);
            setError("No se pudieron cargar las órdenes");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getOrdersByEmail = async (email) => {
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
            setShowAllOrders(false);
            setHasSearched(true);
        } catch (error) {
            console.error("Error fetching orders by email:", error);
            setError("No se pudieron cargar las órdenes para este email");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getOrdersByIdentification = async (identification) => {
        if (!identification.trim()) {
            setError("Por favor ingresa una cédula válida");
            return;
        }

        try {
            setLoading(true);
            setError("");
            
            // SOLUCIÓN: Cargar todas las órdenes y filtrar localmente por cédula
            console.log("🔍 Buscando órdenes por cédula:", identification);
            
            const allOrdersRequest = await fetch(`${API_URL}/orders`, {
                method: "GET",
                credentials: "include",
            });
            
            if (!allOrdersRequest.ok) {
                throw new Error(`Error: ${allOrdersRequest.status}`);
            }
            
            const allOrders = await allOrdersRequest.json();
            
            // Filtrar órdenes por cédula localmente
            const filteredOrders = allOrders.filter(order => {
                const userIdentification = order.user?.Identification;
                return userIdentification && userIdentification.toString() === identification;
            });
            
            console.log(`✅ Encontradas ${filteredOrders.length} órdenes para cédula: ${identification}`);
            setOrders(filteredOrders);
            setShowAllOrders(false);
            setHasSearched(true);
            
        } catch (error) {
            console.error("Error fetching orders by identification:", error);
            setError("No se pudieron cargar las órdenes para esta cédula");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const searchOrders = () => {
        if (!searchTerm.trim()) {
            setError(`Por favor ingresa un ${searchType === 'email' ? 'email' : 'cédula'} válido`);
            return;
        }

        if (searchType === 'email') {
            getOrdersByEmail(searchTerm);
        } else {
            getOrdersByIdentification(searchTerm);
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
            
            console.log("✅ Estado actualizado:", response);
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
            searchOrders();
        }
    };

    // Función para limpiar búsqueda y mostrar todas las órdenes
    const clearSearch = () => {
        setSearchTerm("");
        getAllOrders();
    };

    return (
        <div className="order-page">
            <h1>🍰 Gestión de Órdenes</h1>
            
            {/* Panel de búsqueda */}
            <div className="search-panel">
                <h3>🔍 Buscar Órdenes</h3>
                <div className="search-controls">
                    <div className="search-type-selector">
                        <label htmlFor="searchType">Buscar por:</label>
                        <select 
                            id="searchType"
                            value={searchType} 
                            onChange={(e) => setSearchType(e.target.value)}
                            className="search-type-select"
                        >
                            <option value="email">Email</option>
                            <option value="identification">Cédula</option>
                        </select>
                    </div>
                    
                    <div className="search-input-group">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={
                                searchType === 'email' 
                                    ? "📧 Ingresa el email del usuario..." 
                                    : "🆔 Ingresa la cédula del usuario..."
                            }
                            className="search-input"
                        />
                        {searchTerm && (
                            <button 
                                onClick={clearSearch}
                                className="clear-search-btn"
                                title="Limpiar búsqueda"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    
                    <button 
                        onClick={searchOrders}
                        disabled={loading || !searchTerm.trim()}
                        className="search-btn"
                    >
                        {loading ? "⏳ Buscando..." : "🔍 Buscar"}
                    </button>
                    
                    <button 
                        onClick={getAllOrders}
                        disabled={loading}
                        className="all-orders-btn"
                    >
                        {loading ? "⏳ Cargando..." : "📋 Ver Todas"}
                    </button>
                </div>
                
                <div className="search-info">
                    <p>
                        {showAllOrders 
                            ? `📊 Mostrando todas las órdenes (${orders.length} total)`
                            : searchTerm 
                                ? `🔍 Búsqueda por ${searchType}: "${searchTerm}" - ${orders.length} órdenes encontradas`
                                : "👆 Selecciona un tipo de búsqueda e ingresa el término"
                        }
                    </p>
                </div>
            </div>

            {/* Mensajes de estado */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="loading-state">
                    <p>⏳ Cargando órdenes...</p>
                </div>
            )}

            {/* Sin resultados */}
            {hasSearched && !loading && orders.length === 0 && !error && (
                <div className="no-results">
                    <h3>📭 No se encontraron órdenes</h3>
                    <p>
                        {showAllOrders 
                            ? "No hay órdenes registradas en el sistema"
                            : `No hay órdenes registradas para ${searchType === 'email' ? 'el email' : 'la cédula'}: ${searchTerm}`
                        }
                    </p>
                </div>
            )}

            {/* Lista de órdenes */}
            {hasSearched && orders.length > 0 && (
                <div className="orders-list">
                    <div className="orders-header">
                        <h2>
                            {showAllOrders ? "📋 Todas las Órdenes" : "📋 Órdenes Encontradas"}: 
                            <span className="results-count"> {orders.length}</span>
                        </h2>
                        <div className="orders-meta">
                            <p className="orders-description">
                                {showAllOrders 
                                    ? "Órdenes ordenadas por fecha de llegada (más recientes primero)"
                                    : `Mostrando órdenes ${searchType === 'email' ? 'del email' : 'de la cédula'}: ${searchTerm}`
                                }
                            </p>
                            <p className="last-updated">
                                📅 Actualizado: {new Date().toLocaleDateString('es-ES')}
                            </p>
                        </div>
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
                                    <p className="order-meta">
                                        <strong>📧 Email:</strong> {order.user.email}
                                    </p>
                                    {order.user.Identification && (
                                        <p className="order-meta">
                                            <strong>🆔 Cédula:</strong> {order.user.Identification}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="order-summary">
                                    <p className="order-total">
                                        💰 Total: ${order.total.toFixed(2)}
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}