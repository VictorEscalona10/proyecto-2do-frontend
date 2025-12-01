import { useState } from "react";
import { Category } from "./pages/CategoryPage";
import { ProductPage } from "./pages/ProductPage";
import { Users } from "./pages/UsersPage";
import { OrderPage } from "./pages/OrderPage";
import { PDFTester } from "./pages/PDFTester"; // Nuevo componente
import AdminCustomization from "./pages/Customization";
import "./AdminDashboard.css";

export const AdminDashboard = () => {
  const [tab, setTab] = useState("category");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch(`${API_URL}/auth/logout`, {
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

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const navItems = [
    { id: "category", label: "Inicio", icon: "🏠" },
    { id: "users", label: "Usuarios", icon: "👥" },
    { id: "products", label: "Productos", icon: "📦" },
    { id: "orders", label: "Órdenes", icon: "📋" },
    { id: "customization", label: "Personalización", icon: "🎨" },
    { id: "pdf-tester", label: "Exportar PDFs", icon: "📄" }
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title-section">
            <h1 className="admin-main-title">🍰 Panel de Administración</h1>
            <p className="admin-subtitle">Migdalis Tortas - Gestión Integral</p>
          </div>
          <button 
            onClick={confirmLogout}
            disabled={logoutLoading}
            className="logout-btn"
          >
            {logoutLoading ? "⏳ Cerrando..." : "🚪 Cerrar Sesión"}
          </button>
        </div>
      </header>

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

      <main className="admin-main">
        <div className="admin-content">
          {tab === "category" && <Category />}
          {tab === "users" && <Users />}
          {tab === "products" && <ProductPage />}
          {tab === "orders" && <OrderPage />}
          {tab === "pdf-tester" && <PDFTester />} {/* Nuevo componente */}
          {tab === "customization" && <AdminCustomization />}
        </div>
      </main>

      {/* Modal de Confirmación de Logout */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header warning">
              <h3>⚠️ Confirmar Cierre de Sesión</h3>
              <button className="close-btn" onClick={() => setShowLogoutModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que quieres cerrar sesión?</p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn confirm-btn"
                onClick={handleLogout}
                disabled={logoutLoading}
              >
                {logoutLoading ? "⏳ Cerrando..." : "✅ Sí, Cerrar Sesión"}
              </button>
              <button 
                className="modal-btn cancel-btn"
                onClick={() => setShowLogoutModal(false)}
                disabled={logoutLoading}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};