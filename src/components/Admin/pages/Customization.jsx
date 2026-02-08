import { useState, useEffect } from "react";
import  { useAuth } from "../../../hooks/useAuth";
import "./Customization.css";

export default function AdminCustomization() {
  const { user, isAuthenticated } = useAuth();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Constantes
  const API_URL = import.meta.env.VITE_API_URL;
  const TARGET_CATEGORY_NAME = "tortas personalizadas"; // El nombre que buscamos automáticamente

  // Estados de formularios
  const [newGroup, setNewGroup] = useState({ name: "", min: 0, max: 1 });
  const [newOptions, setNewOptions] = useState({}); // { [groupId]: { name: '', price: '' } }
  const [actionLoading, setActionLoading] = useState(false);

  // Estado del Modal (Copiado de UsersPage para consistencia)
  const [modal, setModal] = useState({
    show: false,
    type: "info",
    message: "",
    onConfirm: null
  });

  // Funciones de Modal modificadas
  const showModal = (message, type = "info", onConfirm = null) => {
    setModal({ show: true, message, type, onConfirm });
    
    // Auto-cerrar solo para alertas satisfactorias después de 2 segundos
    if (type === "success") {
      setTimeout(() => {
        closeModal();
      }, 2000);
    }
  };

  const closeModal = () => {
    setModal({ show: false, message: "", type: "info", onConfirm: null });
  };
  // 1. Cargar Datos Automáticamente al Entrar
  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      // Paso A: Buscar todas las categorías para encontrar el ID de "tortas personalizadas"
      const res = await fetch(`${API_URL}/category`);
      if (!res.ok) throw new Error("Error al conectar con el servidor");
      
      const categories = await res.json();
      const found = categories.find(c => c.name.toLowerCase() === TARGET_CATEGORY_NAME.toLowerCase());

      if (!found) {
        throw new Error(`No se encontró la categoría "${TARGET_CATEGORY_NAME}". Créala en productos primero.`);
      }

      // Paso B: Traer el detalle completo (grupos y opciones) usando el ID encontrado
      const detailRes = await fetch(`${API_URL}/category/${found.id}`);
      const detailData = await detailRes.json();
      
      setCategory(detailData);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      // No mostramos modal de error aquí para no ser intrusivos al cargar, solo log
    }
  };

  // 2. Crear Grupo
  const handleCreateGroup = async (e) => {
    e.preventDefault();

    // Verificación de Auth SOLO al intentar crear
    if (!isAuthenticated) {
      showModal("Debes iniciar sesión como Administrador para guardar cambios.", "error");
      return;
    }
    
    // Verificación de Rol
    if (user?.role !== "ADMINISTRADOR") {
      showModal("Solo los administradores pueden crear grupos.", "error");
      return;
    }

    // Sanitizar nombre de grupo (sin números ni caracteres especiales)
    const sanitizedName = (newGroup.name || '').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '').trim();
    if (!sanitizedName) {
      showModal('El nombre del grupo no puede contener números ni caracteres especiales.', 'warning');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${API_URL}/category/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Importante para enviar Cookies
        body: JSON.stringify({
            name: sanitizedName,
          minSelection: parseInt(newGroup.min),
          maxSelection: parseInt(newGroup.max),
          categoryId: category.id
        })
      });

      if (response.ok) {
        showModal("Grupo de personalización creado con éxito", "success");
        setNewGroup({ name: "", min: 0, max: 1 });
        fetchCategoryData(); // Recargar datos
      } else {
        throw new Error("Error al guardar");
      }
    } catch (error) {
      showModal("Error al crear el grupo. Verifica tu conexión.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Crear Opción
  const handleCreateOption = async (groupId) => {
    const optionData = newOptions[groupId];
    
    // Verificación de Auth
    if (!isAuthenticated) {
      showModal("Debes iniciar sesión para agregar opciones.", "error");
      return;
    }

    if (!optionData || !optionData.name.trim()) {
      showModal("El nombre de la opción es obligatorio.", "warning");
      return;
    }

    // Sanitizar nombre de opción
    const sanitizedOptionName = optionData.name.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '').trim();
    if (!sanitizedOptionName) {
      showModal('El nombre de la opción no puede contener números ni caracteres especiales.', 'warning');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${API_URL}/category/option`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: sanitizedOptionName,
          priceExtra: parseFloat(optionData.price || 0),
          groupId: groupId
        })
      });

      if (response.ok) {
        showModal(`Opción "${optionData.name}" agregada correctamente`, "success");
        // Limpiar input solo de este grupo
        setNewOptions(prev => ({
          ...prev,
          [groupId]: { name: "", price: "" }
        }));
        fetchCategoryData();
      } else {
        throw new Error("Error al guardar opción");
      }
    } catch (error) {
      showModal("Error al agregar la opción.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Manejar inputs de opciones individuales
  const handleOptionInputChange = (groupId, field, value) => {
    // Si el campo es 'name' sanitizamos para evitar números/caracteres especiales
    const newValue = field === 'name'
      ? value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '')
      : value;

    setNewOptions(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [field]: newValue
      }
    }));
  };

  // RENDERIZADO
  if (loading) return <div className="loading-container">Cargando panel de administración...</div>;
  if (!category) return <div className="error-container">No se encontró la categoría base.</div>;

  return (
    <div className="admin-custom-page">
      <header className="page-header">
        <h1>Personalización: {category.name}</h1>
        <p>Gestiona los ingredientes y extras disponibles para tus clientes</p>
      </header>

      {/* FORMULARIO DE CREAR GRUPO */}
      <section className="create-section">
        <h2>Nuevo Grupo (Ej: Relleno, Pisos)</h2>
        <form onSubmit={handleCreateGroup} className="admin-form">
          <div className="form-group">
            <label>Nombre del Grupo</label>
            <input 
              className="admin-input"
              type="text" 
              placeholder="Ej: Sabor del Bizcocho"
              value={newGroup.name}
              onChange={e => setNewGroup({...newGroup, name: e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '')})}
              required
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
              title="El nombre no puede contener números ni caracteres especiales"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Mínimo (0=Opcional)</label>
              <input 
                className="admin-input"
                type="number" min="0"
                value={newGroup.min}
                onChange={e => setNewGroup({...newGroup, min: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Máximo (1=Radio, +1=Checkbox)</label>
              <input 
                className="admin-input"
                type="number" min="1"
                value={newGroup.max}
                onChange={e => setNewGroup({...newGroup, max: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="primary-btn" disabled={actionLoading}>
            {actionLoading ? "Guardando..." : "Crear Grupo"}
          </button>
        </form>
      </section>

      {/* LISTADO DE GRUPOS EXISTENTES */}
      <div className="groups-container">
        {category.customizationGroups?.length === 0 ? (
          <div className="no-groups">No hay grupos de personalización creados todavía.</div>
        ) : (
          category.customizationGroups?.map(group => (
            <div key={group.id} className="group-card">
              <div className="group-header">
                <h3>{group.name}</h3>
                <span className="group-rules">
                  Selección: {group.minSelection} - {group.maxSelection}
                </span>
              </div>

              <div className="group-content">
                {/* Tabla de Opciones */}
                <table className="options-table">
                  <thead>
                    <tr>
                      <th>Opción</th>
                      <th>Precio Extra</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.options?.length === 0 && (
                      <tr><td colSpan="3" style={{textAlign:'center', fontStyle:'italic'}}>Sin opciones</td></tr>
                    )}
                    {group.options?.map(opt => (
                      <tr key={opt.id}>
                        <td>{opt.name}</td>
                        <td>
                          {Number(opt.priceExtra) > 0 ? (
                            <span className="price-badge">+${Number(opt.priceExtra).toFixed(2)}</span>
                          ) : "Gratis"}
                        </td>
                        <td>{opt.isAvailable ? "Disponible" : "No disponible"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Formulario para agregar opción a ESTE grupo */}
                <div className="add-option-form">
                  <input 
                    type="text" 
                    placeholder="Nueva opción (Ej: Chocolate)" 
                    className="admin-input"
                    style={{flex: 2}}
                    value={newOptions[group.id]?.name || ""}
                    onChange={e => handleOptionInputChange(group.id, 'name', e.target.value)}
                    pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
                    title="El nombre no puede contener números ni caracteres especiales"
                  />
                  <input 
                    type="number" 
                    placeholder="Precio $" 
                    className="admin-input"
                    style={{flex: 1}}
                    step="0.01"
                    value={newOptions[group.id]?.price || ""}
                    onChange={e => handleOptionInputChange(group.id, 'price', e.target.value)}
                  />
                  <button 
                    className="secondary-btn"
                    onClick={() => handleCreateOption(group.id)}
                    disabled={actionLoading}
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DEL SISTEMA */}
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
              <button className="modal-btn ok-btn" onClick={closeModal}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}