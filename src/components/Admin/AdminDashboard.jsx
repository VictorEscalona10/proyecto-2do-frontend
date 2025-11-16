import { useState } from "react";
import {Category} from "./pages/CategoryPage"
import {ProductPage} from "./pages/ProductPage"

const Users = () => (
  <div>
    <h2>Usuarios</h2>
    <p>Lista de usuarios...</p>
  </div>
);

export const AdminDashboard = () => {
  const [tab, setTab] = useState("category");

  return (
    <div style={{ padding: 16 }}>
      <h1>Panel de Administración</h1>

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
      </nav>

      <div>
        {tab === "category" && <Category />}
        {tab === "users" && <Users />}
        {tab === "products" && <ProductPage />}
      </div>
    </div>
  );
};
