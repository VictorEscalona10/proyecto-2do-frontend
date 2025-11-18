import { useState } from "react";
import { Category } from "./page/CategoryPage";
import { ProductPage } from "./page/ProductPage";
import { OrderPage } from "./page/OrderPage";
import "./WorkerDashboard.css";

export const WorkerDashboard = () => {
  const [tab, setTab] = useState("orders");
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    if (!window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      return;
    }

    setLogoutLoading(true);

    try {
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  const navItems = [
    { id: "orders", label: "📋 Pedidos", icon: "📋" },
    { id: "category", label: "🏷️ Categorías", icon: "🏷️" },
    { id: "products", label: "📦 Productos", icon: "📦" }
  ];
  
  return (
    <div className="worker-dashboard">
      {/* Header */}
      <header className="worker-header">
        <div className="worker-header-content">
          <div className="worker-title-section">
            <h1 className="worker-main-title">👨‍💼 Panel de Trabajador</h1>
            <p className="worker-subtitle">Migdalis Tortas - Gestión Operativa</p>
          </div>
          <button 
            onClick={handleLogout}
            disabled={logoutLoading}
            className="worker-logout-btn"
          >
            {logoutLoading ? "⏳ Cerrando..." : "🚪 Cerrar Sesión"}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="worker-nav">
        <div className="worker-nav-buttons">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`worker-nav-btn ${tab === item.id ? 'worker-nav-btn-active' : ''}`}
            >
              <span className="worker-nav-icon">{item.icon}</span>
              <span className="worker-nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="worker-main">
        <div className="worker-content">
          {tab === "orders" && <OrderPage />}
          {tab === "category" && <Category />}
          {tab === "products" && <ProductPage />}
        </div>
      </main>
    </div>
  );
};