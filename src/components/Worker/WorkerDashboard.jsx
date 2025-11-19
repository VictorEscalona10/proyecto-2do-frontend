import { useState } from "react";
import { Category } from "./page/CategoryPage";
import { ProductPage } from "./page/ProductPage";


// Luego define el componente principal que los usa
export const WorkerDashboard = () => {
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
        <h1>Panel de Trabajador</h1>
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
        <button onClick={() => setTab("orders")} style={{ marginRight: 8 }}>
          Pedidos
        </button>
        <button onClick={() => setTab("Category")} style={{ marginRight: 8 }}>
            Categorias
        </button>
        <button onClick={() => setTab("products")} style={{ marginRight: 8 }}>
          Productos
        </button>
      </nav>

      <div>
        {tab === "Category" && <Category />}
        {tab === "products" && <ProductPage />}
      </div>
    </div>
  );
};