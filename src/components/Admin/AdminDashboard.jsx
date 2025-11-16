import { useState } from "react";
import { Category } from "./pages/CategoryPage"
import { ProductPage } from "./pages/ProductPage"
import { Users } from "./pages/UsersPage"
import { OrderPage } from "./pages/OrderPage";

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

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Panel de Administración</h1>
        <button 
          onClick={handleLogout}
          disabled={logoutLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: logoutLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {logoutLoading ? 'Cerrando...' : 'Cerrar Sesión'}
        </button>
      </div>

      <nav style={{ marginBottom: 12 }}>
        <button onClick={() => setTab("category")} style={{ marginRight: 8 }}>
          Inicio
        </button>
        <button onClick={() => setTab("users")} style={{ marginRight: 8 }}>
          Usuarios
        </button>
        <button onClick={() => setTab("products")} style={{ marginRight: 8 }}>
          Productos
        </button>
        <button onClick={() => setTab("orders")} style={{ marginRight: 8 }}>
          Ordenes
        </button>
      </nav>

      <div>
        {tab === "category" && <Category />}
        {tab === "users" && <Users />}
        {tab === "products" && <ProductPage />}
        {tab === "orders" && <OrderPage />}
      </div>
    </div>
  );
};