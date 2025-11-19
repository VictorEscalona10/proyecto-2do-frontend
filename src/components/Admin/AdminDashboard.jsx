import { useState } from "react";
import { Category } from "./pages/CategoryPage";
import { ProductPage } from "./pages/ProductPage";
import { Users } from "./pages/UsersPage";
import { OrderPage } from "./pages/OrderPage";
import "./AdminDashboard.css";

export const AdminDashboard = () => {
  const [tab, setTab] = useState("category");
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
    { id: "category", label: "🏠 Inicio", icon: "🏠" },
    { id: "users", label: "👥 Usuarios", icon: "👥" },
    { id: "products", label: "📦 Productos", icon: "📦" },
    { id: "orders", label: "📋 Órdenes", icon: "📋" }
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title-section">
            <h1 className="admin-main-title">🍰 Panel de Administración</h1>
            <p className="admin-subtitle">Migdalis Tortas - Gestión Integral</p>
          </div>
          <button 
            onClick={handleLogout}
            disabled={logoutLoading}
            className="logout-btn"
          >
            {logoutLoading ? "⏳ Cerrando..." : "🚪 Cerrar Sesión"}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="admin-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`nav-btn ${tab === item.id ? 'nav-btn-active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="admin-main">
        <div className="admin-content">
          {tab === "category" && <Category />}
          {tab === "users" && <Users />}
          {tab === "products" && <ProductPage />}
          {tab === "orders" && <OrderPage />}
        </div>
      </main>
    </div>
  );
};