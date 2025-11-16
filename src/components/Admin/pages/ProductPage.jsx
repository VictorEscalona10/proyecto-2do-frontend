import { useState } from "react";
import "./ProductPage.css";

export function ProductPage() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryName: "",
    imagen: null
  });
  const [uploadResult, setUploadResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("name"); // 'name' o 'category'
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  // Función para buscar productos por nombre
  const getProductByName = async (name) => {
    try {
      const response = await fetch(
        `${API_URL}/products/search/name?name=${name}`
      );
      const result = await response.json();
      setProducts(result.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  // Función para buscar productos por categoría
  const getProductsByCategory = async (categoryName) => {
    try {
      const response = await fetch(
        `${API_URL}/products/search/category?name=${categoryName}`
      );
      const result = await response.json();
      setProducts(result.data || []);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      setProducts([]);
    }
  };

  // Función unificada de búsqueda
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    if (searchType === "name") {
      getProductByName(searchTerm);
    } else {
      getProductsByCategory(searchTerm);
    }
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar archivos
  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      imagen: e.target.files[0]
    }));
  };

  // Función para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadResult("Enviando...");

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("price", formData.price);
    fd.append("categoryName", formData.categoryName);
    if (formData.imagen) {
      fd.append("imagen", formData.imagen);
    }

    try {
      const response = await fetch(`${API_URL}/products/create`, {
        method: "POST",
        body: fd,
      });

      const text = await response.text();
      let output;
      try { 
        output = JSON.stringify(JSON.parse(text), null, 2); 
      } catch { 
        output = text; 
      }

      setUploadResult(`HTTP ${response.status} ${response.statusText}\n\n${output}`);
      
      // Limpiar formulario después de enviar
      if (response.ok) {
        setFormData({
          name: "",
          description: "",
          price: "",
          categoryName: "",
          imagen: null
        });
        document.getElementById("imagen").value = "";
      }
    } catch (error) {
      setUploadResult("Error de red: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar búsqueda con Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="product-page">
      <header className="page-header">
        <h1>Gestión de Productos</h1>
        <p>Busca productos por nombre o categoría, y agrega nuevos productos</p>
      </header>

      <div className="page-content">
        {/* Sección de búsqueda unificada */}
        <section className="search-section">
          <h2>Buscar Productos</h2>
          <div className="search-controls">
            <div className="search-type-selector">
              <button
                type="button"
                className={`type-btn ${searchType === 'name' ? 'active' : ''}`}
                onClick={() => setSearchType('name')}
              >
                🔍 Por Nombre
              </button>
              <button
                type="button"
                className={`type-btn ${searchType === 'category' ? 'active' : ''}`}
                onClick={() => setSearchType('category')}
              >
                🗂️ Por Categoría
              </button>
            </div>
            
            <div className="search-input-group">
              <input 
                type="text" 
                placeholder={
                  searchType === 'name' 
                    ? 'Nombre del producto...' 
                    : 'Nombre de la categoría...'
                }
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="search-btn"
                onClick={handleSearch}
                disabled={!searchTerm.trim()}
              >
                {searchType === 'name' ? '🔍 Buscar' : '🗂️ Buscar por Categoría'}
              </button>
            </div>
            
            <div className="search-examples">
              <small>
                {searchType === 'name' 
                  ? 'Ejemplo: tequeños, hamburguesa, pizza...' 
                  : 'Ejemplo: pasapalos salados, bebidas, postres...'
                }
              </small>
            </div>
          </div>
        </section>

        {/* Sección de resultados de búsqueda */}
        <section className="results-section">
          <div className="results-header">
            <h3>
              {searchType === 'name' ? 'Resultados por Nombre' : 'Resultados por Categoría'}
              {products.length > 0 && <span className="results-count"> ({products.length} productos)</span>}
            </h3>
            {products.length > 0 && (
              <button 
                className="clear-results"
                onClick={() => setProducts([])}
              >
                ✕ Limpiar resultados
              </button>
            )}
          </div>
          
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="no-image">📷 No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">${product.price}</p>
                  <div className="product-meta">
                    <span className="product-category">{product.category?.name}</span>
                    <span className="product-id">ID: {product.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {products.length === 0 && searchTerm && (
            <div className="no-products">
              <p>No se encontraron productos {searchType === 'name' ? 'con ese nombre' : 'en esa categoría'}</p>
            </div>
          )}
          
          {products.length === 0 && !searchTerm && (
            <div className="no-search">
              <p>Ingresa un término de búsqueda para encontrar productos</p>
            </div>
          )}
        </section>

        {/* Sección de subida de productos */}
        <section className="upload-section">
          <h2>Agregar Nuevo Producto</h2>
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ingresa el nombre del producto"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe el producto"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Precio</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoryName">Categoría (ID o Nombre)</label>
                <input
                  type="text"
                  id="categoryName"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  placeholder="Ej: 6 o 'pasapalos salados'"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="imagen">Imagen *</label>
              <input
                type="file"
                id="imagen"
                name="imagen"
                onChange={handleFileChange}
                accept="image/*"
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "⏳ Enviando..." : "📤 Subir Producto"}
            </button>
          </form>

          {uploadResult && (
            <div className="result-box">
              <h4>Respuesta del servidor:</h4>
              <pre>{uploadResult}</pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}