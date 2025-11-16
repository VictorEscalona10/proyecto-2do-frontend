import { useState } from "react";
import {Category} from "./pages/CategoryPage"
import { Users } from "./pages/UsersPage"


const Products = () => (
  <div>
    <h2>Productos</h2>
    <p>Lista de productos...</p>
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
        {tab === "products" && <Products />}
      </div>
    </div>
  );
};
