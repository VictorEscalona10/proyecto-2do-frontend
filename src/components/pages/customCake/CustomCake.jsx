import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/AuthContext'; // Ajusta la ruta si es necesario
import styles from './CustomCake.module.css';

export function CustomCakeBuilder() {
  const { user, isAuthenticated } = useAuth(); // Usamos tu contexto existente
  const navigate = useNavigate();

  // Configuración
  const API_URL = import.meta.env.VITE_API_URL;
  const CATEGORY_ID = 19; // ID de "Tortas Personalizadas"
  const PRODUCT_ID_BASE = 1; // ID temporal del producto base
  const BASE_PRICE_FALLBACK = 20.00;

  // Estados
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [basePrice, setBasePrice] = useState(BASE_PRICE_FALLBACK);
  const [selections, setSelections] = useState({}); // { groupId: [optionId, ...] }
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Cargar Datos de la Categoría y Grupos
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/category/${CATEGORY_ID}`);
        
        if (!response.ok) {
          throw new Error('No se pudo cargar la configuración de tortas');
        }

        const data = await response.json();
        setCategory(data);
        
        // Si hay un producto base en la categoría, tomamos su precio, sino el fallback
        // const realBasePrice = data.products?.[0]?.price ? Number(data.products[0].price) : BASE_PRICE_FALLBACK;
        setBasePrice(BASE_PRICE_FALLBACK);
        
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, []);

  // 2. Calcular Precio Total en Tiempo Real
  useEffect(() => {
    if (!category) return;

    let extrasTotal = 0;

    Object.keys(selections).forEach(groupId => {
      const selectedIds = selections[groupId];
      // Buscar el grupo en la data original
      const group = category.customizationGroups.find(g => g.id === Number(groupId));
      
      if (group) {
        selectedIds.forEach(optId => {
          const option = group.options.find(o => o.id === optId);
          if (option) {
            extrasTotal += Number(option.priceExtra);
          }
        });
      }
    });

    setTotalPrice(basePrice + extrasTotal);
  }, [selections, basePrice, category]);

  // 3. Manejar Selección (Radio / Checkbox)
  const handleSelection = (groupId, optionId, maxSelection) => {
    setSelections(prev => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(optionId);
      
      let newSelection;

      if (maxSelection === 1) {
        // Comportamiento Radio Button
        newSelection = [optionId];
      } else {
        // Comportamiento Checkbox
        if (isSelected) {
          newSelection = current.filter(id => id !== optionId);
        } else {
          if (current.length >= maxSelection) {
            alert(`Solo puedes elegir ${maxSelection} opciones en este grupo.`);
            return prev;
          }
          newSelection = [...current, optionId];
        }
      }

      return { ...prev, [groupId]: newSelection };
    });
  };

  // 4. Enviar Orden
  const handleOrder = async () => {
    // Verificación de seguridad en el frontend
    if (!isAuthenticated || !user) {
      // Opcional: Redirigir al login
      alert("🔒 Por favor inicia sesión para realizar tu pedido.");
      navigate('/login'); 
      return;
    }

    // Validar selecciones obligatorias
    const missing = category.customizationGroups.filter(g => 
      g.minSelection > 0 && (!selections[g.id] || selections[g.id].length < g.minSelection)
    );

    if (missing.length > 0) {
      alert(`Falta seleccionar: ${missing.map(g => g.name).join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    // Construir el JSON de personalizaciones para el Backend
    const customizationDetails = [];
    Object.keys(selections).forEach(groupId => {
      const group = category.customizationGroups.find(g => g.id === Number(groupId));
      const selectedIds = selections[groupId];

      selectedIds.forEach(optId => {
        const option = group.options.find(o => o.id === optId);
        if (option) {
          customizationDetails.push({
            name: option.name,
            price: Number(option.priceExtra)
          });
        }
      });
    });

    const payload = {
      userId: user.id,
      items: [
        {
          id: PRODUCT_ID_BASE,
          count: 1,
          price: totalPrice,
          customizations: customizationDetails // <--- Esto es lo que lee tu servicio PDF
        }
      ]
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // CRUCIAL: Envía la cookie JWT automáticamente
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // Puedes usar tu modal personalizado aquí si quieres
        alert(`✅ ¡Pedido #${data.order.id} creado con éxito!\nRevisa tu correo para ver el detalle.`);
        navigate('/home'); // Redirigir al perfil para ver la orden
      } else {
        throw new Error(data.message || 'Error al procesar el pedido');
      }

    } catch (err) {
      console.error(err);
      alert('❌ Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Horneando opciones... 🎂</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainContainer}>
        
        <header className={styles.header}>
          <h1 className={styles.title}>Diseña tu Torta Ideal</h1>
          <p className={styles.subtitle}>Personaliza ingredientes, pisos y decoración a tu gusto.</p>
        </header>

        {category?.customizationGroups?.map(group => (
          <div key={group.id} className={styles.groupSection}>
            <div className={styles.groupHeader}>
              <h3 className={styles.groupTitle}>{group.name}</h3>
              <span className={`${styles.badge} ${group.minSelection > 0 ? styles.required : styles.optional}`}>
                {group.minSelection > 0 ? 'Obligatorio' : `Opcional (Máx ${group.maxSelection})`}
              </span>
            </div>

            <div className={styles.optionsGrid}>
              {group.options.filter(opt => opt.isAvailable).map(option => {
                const isSelected = (selections[group.id] || []).includes(option.id);
                
                return (
                  <label key={option.id} className={styles.optionCard}>
                    <input 
                      type={group.maxSelection === 1 ? "radio" : "checkbox"}
                      name={`group_${group.id}`}
                      checked={isSelected}
                      onChange={() => handleSelection(group.id, option.id, group.maxSelection)}
                    />
                    <div className={styles.cardContent}>
                      <span className={styles.optionName}>{option.name}</span>
                      <span className={styles.optionPrice}>
                        {Number(option.priceExtra) > 0 ? `+ $${Number(option.priceExtra).toFixed(2)}` : 'Gratis'}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <footer className={styles.stickyFooter}>
          <div className={styles.totalInfo}>
            <span className={styles.totalLabel}>Total Estimado</span>
            <span className={styles.totalPrice}>${totalPrice.toFixed(2)}</span>
            {!isAuthenticated && (
              <span className={styles.loginWarning}>⚠️ Inicia sesión para ordenar</span>
            )}
          </div>

          <button 
            className={styles.actionButton}
            onClick={handleOrder}
            disabled={!isAuthenticated || isSubmitting}
            title={!isAuthenticated ? "Debes iniciar sesión" : "Confirmar pedido"}
          >
            {isSubmitting ? 'Procesando...' : (isAuthenticated ? 'Realizar Pedido 🧁' : 'Loguéate para Pedir')}
          </button>
        </footer>

      </div>
    </div>
  );
}