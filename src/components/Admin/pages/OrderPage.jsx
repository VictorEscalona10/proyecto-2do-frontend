import { useState } from "react";

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
        <div className="order-page" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <h1 style={{ color: "#333", marginBottom: "20px" }}>Gestión de Órdenes</h1>
            
            {/* Panel de búsqueda */}
            <div style={{ 
                marginBottom: "30px", 
                padding: "20px", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "8px",
                border: "1px solid #e9ecef"
            }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#495057" }}>Buscar Órdenes por Email</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ingresa el email del usuario"
                        style={{ 
                            padding: "10px 12px", 
                            border: "1px solid #ced4da", 
                            borderRadius: "4px",
                            flex: "1",
                            minWidth: "250px",
                            fontSize: "16px"
                        }}
                    />
                    <button 
                        onClick={() => getOrdersByUser(userEmail)}
                        disabled={loading}
                        style={{ 
                            padding: "10px 20px", 
                            backgroundColor: "#007bff", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: "16px",
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? "Buscando..." : "Buscar Órdenes"}
                    </button>
                </div>
                {!hasSearched && (
                    <p style={{ margin: "10px 0 0 0", color: "#6c757d", fontSize: "14px" }}>
                        Ingresa un email y presiona el botón para buscar las órdenes
                    </p>
                )}
            </div>

            {/* Mensajes de estado */}
            {error && (
                <div style={{ 
                    color: "#721c24", 
                    backgroundColor: "#f8d7da", 
                    padding: "12px", 
                    borderRadius: "4px",
                    marginBottom: "20px",
                    border: "1px solid #f5c6cb"
                }}>
                    {error}
                </div>
            )}

            {/* Estado inicial - sin búsqueda */}
            {!hasSearched && !loading && (
                <div style={{ 
                    textAlign: "center", 
                    padding: "40px",
                    color: "#6c757d",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px dashed #dee2e6"
                }}>
                    <h3>No se ha realizado ninguna búsqueda</h3>
                    <p>Ingresa un email arriba y presiona "Buscar Órdenes" para ver las órdenes del usuario.</p>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <p style={{ fontSize: "18px", color: "#007bff" }}>Buscando órdenes...</p>
                </div>
            )}

            {/* Sin resultados */}
            {hasSearched && !loading && orders.length === 0 && !error && (
                <div style={{ 
                    textAlign: "center", 
                    padding: "40px",
                    color: "#6c757d",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                }}>
                    <h3>No se encontraron órdenes</h3>
                    <p>No hay órdenes registradas para el email: <strong>{userEmail}</strong></p>
                </div>
            )}

            {/* Lista de órdenes */}
            {hasSearched && orders.length > 0 && (
                <div className="orders-list">
                    <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        marginBottom: "20px" 
                    }}>
                        <h2 style={{ color: "#333", margin: 0 }}>
                            Órdenes Encontradas: {orders.length}
                        </h2>
                        <p style={{ color: "#6c757d", margin: 0 }}>
                            Email: <strong>{userEmail}</strong>
                        </p>
                    </div>

                    {orders.map((order) => (
                        <div key={order.id} className="order-card" style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            padding: "20px",
                            marginBottom: "20px",
                            backgroundColor: "white",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}>
                            {/* Header de la orden */}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: "16px",
                                paddingBottom: "16px",
                                borderBottom: "1px solid #eee"
                            }}>
                                <div>
                                    <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>
                                        Orden #{order.id}
                                    </h3>
                                    <p style={{ margin: "4px 0", color: "#666" }}>
                                        <strong>Fecha:</strong> {formatDate(order.orderDate)}
                                    </p>
                                    <p style={{ margin: "4px 0", color: "#666" }}>
                                        <strong>Cliente:</strong> {order.user.name}
                                    </p>
                                </div>
                                
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ 
                                        margin: "4px 0", 
                                        fontSize: "1.2em", 
                                        fontWeight: "bold",
                                        color: "#28a745"
                                    }}>
                                        Total: ${order.total}
                                    </p>
                                    <div className="status-control">
                                        <label htmlFor={`status-${order.id}`} style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
                                            Cambiar Estado:
                                        </label>
                                        <select
                                            id={`status-${order.id}`}
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value, order.user.name)}
                                            disabled={loading}
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: "4px",
                                                border: "1px solid #ddd",
                                                backgroundColor: "white",
                                                minWidth: "120px"
                                            }}
                                        >
                                            <option value="PENDING">Pendiente</option>
                                            <option value="PROCESSED">Procesada</option>
                                            <option value="CANCELLED">Cancelada</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Estado actual */}
                            <div style={{ marginBottom: "16px" }}>
                                <span style={{ 
                                    padding: "6px 16px", 
                                    borderRadius: "20px", 
                                    fontSize: "0.9em",
                                    fontWeight: "bold",
                                    backgroundColor: 
                                        order.status === "PENDING" ? "#fff3cd" :
                                        order.status === "PROCESSED" ? "#d1ecf1" : "#f8d7da",
                                    color: 
                                        order.status === "PENDING" ? "#856404" :
                                        order.status === "PROCESSED" ? "#0c5460" : "#721c24",
                                    border: 
                                        order.status === "PENDING" ? "1px solid #ffeaa7" :
                                        order.status === "PROCESSED" ? "1px solid #bee5eb" : "1px solid #f5c6cb"
                                }}>
                                    Estado actual: {getStatusText(order.status)}
                                </span>
                            </div>

                            {/* Detalles de la orden */}
                            <div>
                                <h4 style={{ margin: "0 0 12px 0", color: "#333" }}>
                                    Productos ({getTotalItems(order.orderDetails)} items)
                                </h4>
                                <div className="order-details">
                                    {order.orderDetails.map((detail) => (
                                        <div key={detail.id} style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "12px 0",
                                            borderBottom: "1px solid #f5f5f5"
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>
                                                    {detail.product.name}
                                                </p>
                                                <p style={{ margin: "0", color: "#666", fontSize: "0.9em" }}>
                                                    {detail.product.description}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <p style={{ margin: "0", color: "#666" }}>
                                                    {detail.quantity} x ${detail.unitPrice}
                                                </p>
                                                <p style={{ margin: "0", fontWeight: "bold", color: "#28a745" }}>
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