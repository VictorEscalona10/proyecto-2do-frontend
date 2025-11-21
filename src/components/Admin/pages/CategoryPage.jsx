import { useState } from "react";
import "./CategoryPage.css";

export function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
 
  const getCategories = async () => {
    setLoading(true);
    try {
      const request = await fetch(`${API_URL}/category`);
      const response = await request.json();
      setCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name) => {
    if (!name.trim()) {
      alert("Por favor ingresa un nombre para la categoría");
      return;
    }

    try {
      const request = await fetch(`${API_URL}/category/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      const response = await request.json();
      setCategories([...categories, response]);
      setNewCategory("");
      alert("✅ Categoría creada con éxito");
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Error al crear la categoría");
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) {
      return;
    }

    try {
      await fetch(`${API_URL}/category/delete/${name}`, {
        method: "DELETE",
        credentials: "include",
      });
      setCategories(categories.filter((category) => category.name !== name));
      alert("✅ Categoría eliminada con éxito");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Error al eliminar la categoría");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createCategory(newCategory);
  };

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>🎯 Gestión de Categorías</h1>
        <p>Administra las categorías de productos de la repostería</p>
      </div>

      <div className="category-actions">
        <button 
          onClick={getCategories} 
          className="load-btn"
          disabled={loading}
        >
          {loading ? "⏳ Cargando..." : "📥 Cargar Categorías"}
        </button>
      </div>

      {/* Formulario para agregar categoría */}
      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-group">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="📝 Nombre de la nueva categoría"
            className="category-input"
          />
          <button type="submit" className="add-btn">
            ➕ Agregar Categoría
          </button>
        </div>
      </form>

      {/* Lista de categorías */}
      <div className="categories-list">
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>📭 No hay categorías cargadas</p>
            <p>Haz clic en "Cargar Categorías" para ver las existentes</p>
          </div>
        ) : (
          <>
            <h3>📂 Categorías Existentes ({categories.length})</h3>
            <div className="categories-grid">
              {categories.map((category) => (
                <div key={category.name} className="category-card">
                  <div className="category-info">
                    <span className="category-name">🏷️ {category.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(category.name)}
                    className="delete-btn"
                    title="Eliminar categoría"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}