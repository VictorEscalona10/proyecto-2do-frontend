import { useState, useEffect } from "react";
import "./ProductPage.css";

export function ProductPage({ onShowModal }) {
  // <- Agregar esta prop
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imagen: null,
  });
  const [uploadResult, setUploadResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Cargar todos los productos al inicio
  useEffect(() => {
    getAllProducts();
  }, []);

  // Agrupar productos por categoría cuando cambia la lista de productos
  useEffect(() => {
    groupProductsByCategory();
  }, [products]);
  const getAllCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/category`);
      const result = await response.json();
      setAvailableCategories(result.data || result);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setAvailableCategories([]);
    }
  };

  // Función para agrupar productos por categoría
  const groupProductsByCategory = () => {
    const grouped = {};
    const categoryList = [];

    products.forEach((product) => {
      const categoryName = product.category?.name || "Sin Categoría";

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
        categoryList.push(categoryName);
      }

      grouped[categoryName].push(product);
    });

    setGroupedProducts(grouped);
    setCategories(categoryList.sort());
  };

  // Obtener todos los productos
  const getAllProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        // Si el endpoint /products no existe, usar búsqueda vacía como fallback
        const fallbackResponse = await fetch(
          `${API_URL}/products/search/name?name=`,
        );
        const fallbackResult = await fallbackResponse.json();
        setProducts(fallbackResult.data || []);
        return;
      }
      const result = await response.json();
      setProducts(result.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback: intentar obtener productos mediante búsqueda vacía
      try {
        const fallbackResponse = await fetch(
          `${API_URL}/products/search/name?name=`,
        );
        const fallbackResult = await fallbackResponse.json();
        setProducts(fallbackResult.data || []);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setProducts([]);
      }
    }
  };

  // Función para buscar productos por nombre
  const getProductByName = async (name) => {
    try {
      const response = await fetch(
        `${API_URL}/products/search/name?name=${encodeURIComponent(name)}`,
      );
      const result = await response.json();
      setProducts(result.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  // Función para buscar productos por categoría usando ID
  const getProductsByCategory = async (categoryId) => {
    try {
      const response = await fetch(
        `${API_URL}/products/search/category?id=${encodeURIComponent(categoryId)}`,
      );
      const result = await response.json();
      console.log("Category search result:", result); // Para debugging
      setProducts(result.data || []);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      setProducts([]);
    }
  };

  // Función unificada de búsqueda - MEJORADA
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      getAllProducts();
      return;
    }

    if (searchType === "name") {
      getProductByName(searchTerm);
    } else {
      getProductsByCategory(searchTerm);
    }
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validación: el nombre NO puede contener números
    if (name === "name") {
      const onlyLetters = value.replace(/[0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        name: onlyLetters,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para manejar archivos
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      imagen: e.target.files[0],
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
    fd.append("categoryId", Number(formData.categoryId));

    if (formData.imagen) {
      fd.append("imagen", formData.imagen);
    }

    try {
      const response = await fetch(`${API_URL}/products/create`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const text = await response.text();
      let output;
      try {
        output = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        output = text;
      }

      setUploadResult(
        `HTTP ${response.status} ${response.statusText}\n\n${output}`,
      );

      // Limpiar formulario después de enviar
      if (response.ok) {
        setFormData({
          name: "",
          description: "",
          price: "",
          categoryId: "",
          imagen: null,
        });
        document.getElementById("imagen").value = "";
        // Recargar la lista de productos
        getAllProducts();

        // MOSTRAR ALERTA DE ÉXITO
        if (onShowModal) {
          onShowModal({
            type: "success",
            message: "✅ Producto creado con éxito",
            autoClose: true,
          });
        }

        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          setShowModal(false);
          setUploadResult("");
        }, 2000);
      } else {
        // Mostrar error si la respuesta no fue exitosa
        if (onShowModal) {
          onShowModal({
            type: "error",
            message: "Error al crear el producto",
          });
        }
      }
    } catch (error) {
      setUploadResult("Error de red: " + error.message);
      // Mostrar error de red
      if (onShowModal) {
        onShowModal({
          type: "error",
          message: "Error de red al crear el producto",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar búsqueda con Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Función para limpiar búsqueda y mostrar todos los productos
  const clearSearch = () => {
    setSearchTerm("");
    getAllProducts();
  };

  // Función para abrir el modal
  const openModal = () => {
    setShowModal(true);
    setUploadResult("");
    getAllCategories();
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setShowModal(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      imagen: null,
    });
    setUploadResult("");
    // Limpiar el input de archivo
    const fileInput = document.getElementById("imagen");
    if (fileInput) fileInput.value = "";
  };

  // Calcular el total de productos
  const totalProducts = products.length;

  return (
    <div className="product-page">
      <header className="page-header">
        <h1>Gestión de Productos</h1>
        <p>Busca productos por nombre o categoría</p>
      </header>

      <div className="page-content">
        {/* Sección de búsqueda unificada - MEJORADA */}
        <section className="search-section">
          <h2>Buscar Productos</h2>
          <div className="search-controls">
            <div className="search-type-selector">
              <button
                type="button"
                className={`type-btn ${searchType === "name" ? "active" : ""}`}
                onClick={() => setSearchType("name")}
              >
                Por Nombre
              </button>
              <button
                type="button"
                className={`type-btn ${searchType === "category" ? "active" : ""}`}
                onClick={() => setSearchType("category")}
              >
                Por Categoría
              </button>
            </div>

            <div className="search-input-group">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder={
                    searchType === "name"
                      ? "Ejemplo: tequeños, hamburguesa, pizza..."
                      : "Ejemplo: 6 (ID de categoría)"
                  }
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                {searchTerm && (
                  <button
                    className="clear-search-btn"
                    onClick={clearSearch}
                    type="button"
                  >
                    X
                  </button>
                )}
              </div>
              <button
                className="search-btn"
                onClick={handleSearch}
                disabled={!searchTerm.trim()}
              >
                Buscar
              </button>
            </div>
          </div>
        </section>

        {/* Sección de resultados de búsqueda */}
        <section className="results-section">
          <div className="results-header">
            <h3>
              {searchTerm
                ? `Resultados de búsqueda ${searchType === "name" ? "por nombre" : "por categoría"}`
                : "Todos los Productos"}
              {totalProducts > 0 && (
                <span className="results-count">
                  {" "}
                  ({totalProducts} productos)
                </span>
              )}
            </h3>
            {totalProducts > 0 && (
              <button
                className="clear-results"
                onClick={() => {
                  setProducts([]);
                  setSearchTerm("");
                }}
              >
                Limpiar resultados
              </button>
            )}
          </div>

          {/* Mostrar productos agrupados por categoría */}
          {totalProducts > 0 ? (
            <div className="categories-container">
              {categories.map((categoryName) => (
                <div key={categoryName} className="category-section">
                  <div className="category-header">
                    <h4 className="category-title">{categoryName}</h4>
                    <span className="category-count">
                      {groupedProducts[categoryName].length} producto
                      {groupedProducts[categoryName].length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="products-grid">
                    {groupedProducts[categoryName].map((product) => (
                      <div key={product.id} className="product-card">
                        <div className="product-image">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                          ) : (
                            <div className="no-image">Sin imagen</div>
                          )}
                        </div>
                        <div className="product-info">
                          <h4>{product.name}</h4>
                          <p className="product-description">
                            {product.description}
                          </p>
                          <p className="product-price">${product.price}</p>
                          <div className="product-meta">
                            <span className="product-category">
                              {product.category?.name}
                            </span>
                            <span className="product-id">
                              ID: {String(product.id).slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              {searchTerm ? (
                <p>
                  No se encontraron productos{" "}
                  {searchType === "name"
                    ? "con ese nombre"
                    : "en esa categoría"}
                </p>
              ) : (
                <p>No hay productos disponibles en este momento</p>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Botón flotante para agregar producto */}
      <button
        className="floating-add-btn"
        onClick={openModal}
        title="Agregar nuevo producto"
      >
        +
      </button>

      {/* Modal para agregar producto */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar Nuevo Producto</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
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
                    pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
                    title="El nombre no puede contener números"
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
                    <label htmlFor="categoryId">Categoría (ID)</label>
                    <div className="form-group">
                      <label htmlFor="categoryId">Categoría *</label>
                      <select
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Selecciona una categoría</option>
                        {availableCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
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
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Enviando..." : "Subir Producto"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
