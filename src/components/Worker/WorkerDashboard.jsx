import { useState } from "react";
import { Category } from "./page/CategoryPage";
import { ProductPage } from "./page/ProductPage";
import { Users } from "./page/UsersPage";

// Primero define los componentes que se van a usar
const Orders = () => {
  return (
    <div>
      <h1>Pedidos</h1>
    </div>
  );
};


// Luego define el componente principal que los usa
export const WorkerDashboard = () => {
  const [tab, setTab] = useState("category");

  return (
    <div style={{ padding: 16 }}>
      <h1>Panel de Trabajador</h1>

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
        <button onClick={() => setTab("users")} style={{ marginRight: 8 }}>
          Usuarios
        </button>
      </nav>

      <div>
        {tab === "orders" && <Orders />}
        {tab === "Category" && <Category />}
        {tab === "products" && <ProductPage />}
        {tab === "users" && <Users />}
      </div>
    </div>
  );
};