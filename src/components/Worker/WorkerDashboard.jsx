import { useState } from "react";
import { Category } from "./page/CategoryPage";
import { ProductPage } from "./page/ProductPage";
import { OrderPage } from "./page/OrderPage";
import "./WorkerDashboard.css";

// Componente Modal (copiado del Users)
const Modal = ({ show, type, message, onConfirm, onClose, autoClose }) => {
  if (!show) return null;

  const getModalTitle = () => {
    switch (type) {
      case 'success': return '✅ Operación Exitosa';
      case 'error': return '❌ Error';
      case 'warning': return '⚠️ Advertencia';
      case 'confirm': return '❓ Confirmación';
      default: return 'Mensaje del Sistema';
    }
  };

  return (
    <div className="modal-overlay" onClick={type === 'confirm' || type === 'error' ? onClose : undefined}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${type}`}>
          <h3>{getModalTitle()}</h3>
          {(type === 'confirm' || type === 'error') && (
            <button className="close-btn" onClick={onClose}>×</button>
          )}
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          {type === 'confirm' ? (
            <>
              <button 
                className="modal-btn confirm-btn"
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
              >
                ✅ Sí
              </button>
              <button 
                className="modal-btn cancel-btn"
                onClick={onClose}
              >
                ❌ No
              </button>
            </>
          ) : (
            <button 
              className="modal-btn ok-btn"
              onClick={onClose}
            >
              Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export const WorkerDashboard = () => {
  const [tab, setTab] = useState("orders");
  const [logoutLoading, setLogoutLoading] = useState(false);
  
  // Estado para el modal
const [modal, setModal] = useState({
  show: false,
  type: 'info',
  message: '',
  onConfirm: null,
  autoClose: false
});

const showModal = (modalConfig) => {
  setModal({
    show: true,
    type: modalConfig.type || 'info',
    message: modalConfig.message,
    onConfirm: modalConfig.onConfirm,
    autoClose: modalConfig.autoClose || false
  });

  // Cierre automático para alertas de éxito después de 2 segundos
  if (modalConfig.type === 'success' || modalConfig.autoClose) {
    setTimeout(() => {
      closeModal();
    }, 2000);
  }
};

const closeModal = () => {
  setModal({
    show: false,
    type: 'info',
    message: '',
    onConfirm: null,
    autoClose: false
  });
};
  const handleLogout = async () => {
    showModal({
      type: 'confirm',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      onConfirm: async () => {
        setLogoutLoading(true);
        try {
          await fetch(`${API_URL}/auth/logout`, {
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
      }
    });
  };

  const navItems = [
    { id: "orders", label: "Pedidos", icon: "📋" },
    { id: "category", label: "Categorías", icon: "🏷️" },
    { id: "products", label: "Productos", icon: "📦" }
  ];
  
  return (
    <div className="worker-dashboard">
      {/* Header */}
      <header className="worker-header">
        <div className="worker-header-content">
          <div className="worker-title-section">
            <h1 className="worker-main-title">👨‍💼 Panel de Trabajador</h1>
            <p className="worker-subtitle">Migdalis Tortas - Gestión Operativa</p>
          </div>
          <button 
            onClick={handleLogout}
            disabled={logoutLoading}
            className="worker-logout-btn"
          >
            {logoutLoading ? "⏳ Cerrando..." : "🚪 Cerrar Sesión"}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="worker-nav">
        <div className="worker-nav-buttons">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`worker-nav-btn ${tab === item.id ? 'worker-nav-btn-active' : ''}`}
            >
              <span className="worker-nav-icon">{item.icon}</span>
              <span className="worker-nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="worker-main">
        <div className="worker-content">
          {tab === "orders" && <OrderPage onShowModal={showModal} />}
          {tab === "category" && <Category onShowModal={showModal} />}
          {tab === "products" && <ProductPage onShowModal={showModal} />}
        </div>
      </main>

      {/* Modal */}
      <Modal
        show={modal.show}
        type={modal.type}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onClose={closeModal}
      />
    </div>
  );
};