import { useState, useEffect } from "react";
import "./CategoryPage.css";

export function Category() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [activeTab, setActiveTab] = useState('list');
  const [modal, setModal] = useState({ show: false, message: "", type: "" });

  const API_URL = import.meta.env.VITE_API_URL;

  const showModal = (message, type = "info") => {
    setModal({ show: true, message, type });
    
    // Auto-cerrar solo para alertas satisfactorias después de 2 segundos
    if (type === "success") {
      setTimeout(() => {
        closeModal();
      }, 2000);
    }
  };

  const closeModal = () => {
    setModal({ show: false, message: "", type: "" });
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category => {
        if (searchType === 'name') {
          return category.name.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          return category.id.toString().includes(searchTerm);
        }
      });
      setFilteredCategories(filtered);
    }
  }, [searchTerm, searchType, categories]);

  const getCategories = async () => {
    setLoading(true);
    try {
      const request = await fetch(`${API_URL}/category`);
      const response = await request.json();
      setCategories(response);
      setFilteredCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showModal("Error al cargar las categorías", "error");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name) => {
    if (!name.trim()) {
      showModal("Por favor ingresa un nombre para la categoría", "warning");
      return;
    }

    // Validar que el nombre no contenga números u otros caracteres inválidos
    const sanitized = name.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '').trim();
    if (!sanitized) {
      showModal("El nombre de la categoría no puede contener números ni caracteres especiales", "warning");
      return;
    }

    try {
      const request = await fetch(`${API_URL}/category/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: sanitized.toLowerCase() }),
      });
      
      if (!request.ok) {
        throw new Error('Error al crear la categoría');
      }
      
      const response = await request.json();
      setCategories([...categories, response]);
      setNewCategory("");
      showModal("Categoría creada con éxito", "success");
    } catch (error) {
      console.error("Error creating category:", error);
      showModal("Error al crear la categoría", "error");
    }
  };

  const handleDelete = async (name) => {
    showModal(
      `¿Estás seguro de eliminar la categoría "${name}"?`,
      "confirm",
      async () => {
        try {
          await fetch(`${API_URL}/category/delete/${name}`, {
            method: "DELETE",
            credentials: "include",
          });
          setCategories(categories.filter((category) => category.name !== name));
          showModal("Categoría eliminada con éxito", "success");
        } catch (error) {
          console.error("Error deleting category:", error);
          showModal("Error al eliminar la categoría", "error");
        }
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createCategory(newCategory);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchTerm("");
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>Gestión de Categorías</h1>
        <p>Administra las categorías de productos de la repostería</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Lista de Categorías
        </button>
        <button 
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Crear Categoría
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="list-panel">
          <div className="search-panel">
            <h3>Buscar Categorías</h3>
            <div className="search-controls">
              <div className="search-type-selector">
                <label htmlFor="searchType">Buscar por:</label>
                <select 
                  id="searchType"
                  value={searchType} 
                  onChange={handleSearchTypeChange}
                  className="search-type-select"
                >
                  <option value="name">Nombre</option>
                  <option value="id">ID</option>
                </select>
              </div>
              
              <div className="search-input-group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder={searchType === 'name' ? "Buscar por nombre..." : "Buscar por ID..."}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    onClick={clearSearch}
                    className="clear-search-btn"
                    title="Limpiar búsqueda"
                  >
                    X
                  </button>
                )}
              </div>
            </div>
            
            <div className="search-info">
              <p>
                Mostrando {filteredCategories.length} de {categories.length} categorías
                {searchTerm && ` - Filtrado por: "${searchTerm}"`}
              </p>
            </div>
          </div>

          <div className="category-actions">
            <button 
              onClick={getCategories} 
              className="load-btn"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Actualizar Lista"}
            </button>
          </div>

          <div className="categories-list">
            {loading ? (
              <div className="loading-state">
                <p>Cargando categorías...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="empty-state">
                {searchTerm ? (
                  <>
                    <p>No se encontraron categorías</p>
                    <p>No hay resultados para "{searchTerm}"</p>
                    <button onClick={clearSearch} className="load-btn">
                      Mostrar todas
                    </button>
                  </>
                ) : (
                  <>
                    <p>No hay categorías cargadas</p>
                    <p>Haz clic en "Actualizar Lista" para cargar las categorías</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <h3>Categorías Existentes ({filteredCategories.length})</h3>
                <div className="categories-grid">
                  {filteredCategories.map((category) => (
                    <div key={category.id} className="category-card">
                      <div className="category-info">
                        <div className="category-id">ID: {category.id}</div>
                        <span className="category-name">{category.name}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(category.name)}
                        className="delete-btn"
                        title="Eliminar categoría"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="create-panel">
          <div className="category-form">
            <h3>Crear Nueva Categoría</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
                    setNewCategory(val);
                  }}
                  placeholder="Nombre de la nueva categoría"
                  className="category-input"
                  required
                  pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
                  title="El nombre no puede contener números ni caracteres especiales"
                />
                <button type="submit" className="add-btn">
                  Crear Categoría
                </button>
              </div>
            </form>
            <p className="form-description">
              Las categorías se crearán en minúsculas automáticamente
            </p>
          </div>

          <div className="existing-categories-preview">
            <h4>Categorías Existentes ({categories.length})</h4>
            {categories.length > 0 ? (
              <div className="categories-preview-list">
                {categories.slice(0, 5).map((category) => (
                  <div key={category.id} className="category-preview-item">
                    <span>#{category.id} - {category.name}</span>
                  </div>
                ))}
                {categories.length > 5 && (
                  <div className="preview-more">
                    ... y {categories.length - 5} más
                  </div>
                )}
              </div>
            ) : (
              <p className="no-categories">No hay categorías cargadas</p>
            )}
          </div>
        </div>
      )}

      {/* Modal Personalizado */}
      {modal.show && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header ${modal.type}`}>
              <h3>Mensaje del Sistema</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>{modal.message}</p>
            </div>
            <div className="modal-footer">
              {modal.type === 'confirm' ? (
                <>
                  <button 
                    className="modal-btn confirm-btn"
                    onClick={() => {
                      modal.onConfirm?.();
                      closeModal();
                    }}
                  >
                    Sí
                  </button>
                  <button 
                    className="modal-btn cancel-btn"
                    onClick={closeModal}
                  >
                    No
                  </button>
                </>
              ) : (
                <button 
                  className="modal-btn ok-btn"
                  onClick={closeModal}
                >
                  Aceptar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}