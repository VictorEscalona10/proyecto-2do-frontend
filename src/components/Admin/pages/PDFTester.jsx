import React, { useState } from 'react';
import styles from './PDFTester.module.css';

// Componente Modal
const Modal = ({ show, type, message, onConfirm, onClose, autoHide }) => {
  if (!show) return null;

  const getModalTitle = () => {
    switch (type) {
      case 'success': return 'Operación Exitosa';
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      case 'confirm': return 'Confirmación';
      default: return 'Mensaje del Sistema';
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modalContent} ${autoHide ? styles.modalAutoHide : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${styles.modalHeader} ${styles[type]}`}>
          <h3>{getModalTitle()}</h3>
          {!autoHide && (
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          )}
        </div>
        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>
        {!autoHide && (
          <div className={styles.modalFooter}>
            {type === 'confirm' ? (
              <>
                <button 
                  className={`${styles.modalBtn} ${styles.confirmBtn}`}
                  onClick={() => {
                    onConfirm?.();
                    onClose();
                  }}
                >
                  Sí
                </button>
                <button 
                  className={`${styles.modalBtn} ${styles.cancelBtn}`}
                  onClick={onClose}
                >
                  No
                </button>
              </>
            ) : (
              <button 
                className={`${styles.modalBtn} ${styles.okBtn}`}
                onClick={onClose}
              >
                Aceptar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const PDFTester = () => {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    type: 'info',
    message: '',
    onConfirm: null,
    autoHide: false
  });

  const showModal = (modalConfig) => {
    setModal({
      show: true,
      type: modalConfig.type || 'info',
      message: modalConfig.message,
      onConfirm: modalConfig.onConfirm,
      autoHide: modalConfig.autoHide || false
    });

    // Auto-hide después de 1 segundo si está configurado
    if (modalConfig.autoHide) {
      setTimeout(() => {
        closeModal();
      }, 1000);
    }
  };

  const closeModal = () => {
    setModal({
      show: false,
      type: 'info',
      message: '',
      onConfirm: null,
      autoHide: false
    });
  };

  const handleDownload = async (url, filename) => {
    try {
      setLoading(true);
      
      // Mostrar mensaje de inicio
      showModal({
        type: 'success',
        message: `Generando PDF...`,
        autoHide: false
      });

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      // Mostrar mensaje de éxito que se auto-cierra
      showModal({
        type: 'success',
        message: `PDF "${filename}" descargado exitosamente`,
        autoHide: true
      });
      
    } catch (error) {
      console.error('Error descargando PDF:', error);
      showModal({
        type: 'error',
        message: `Error al descargar el PDF: ${error.message}`,
        autoHide: true
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFilteredLogs = () => {
    const tableName = document.getElementById('tableName')?.value || '';
    const action = document.getElementById('action')?.value || '';

    let url = `${API_URL}/db-logs/export/pdf?`;
    const params = [];
    if (tableName) params.push(`tableName=${tableName}`);
    if (action) params.push(`action=${action}`);
    
    url += params.join('&');
    
    showModal({
      type: 'confirm',
      message: `¿Generar reporte de logs${tableName ? ` de la tabla ${tableName}` : ''}${action ? ` con acción ${action}` : ''}?`,
      onConfirm: () => handleDownload(url, `logs-filtrado-${Date.now()}.pdf`)
    });
  };

  const downloadFilteredUsers = () => {
    const role = document.getElementById('userRole')?.value || '';
    const isActive = document.getElementById('userStatus')?.value || '';

    let url = `${API_URL}/users/export/pdf?`;
    const params = [];
    if (role) params.push(`role=${role}`);
    if (isActive) params.push(`isActive=${isActive}`);
    
    url += params.join('&');
    
    showModal({
      type: 'confirm',
      message: `¿Generar reporte de usuarios${role ? ` con rol ${role}` : ''}${isActive ? ` ${isActive === 'true' ? 'activos' : 'inactivos'}` : ''}?`,
      onConfirm: () => handleDownload(url, `usuarios-filtrado-${Date.now()}.pdf`)
    });
  };

  const downloadSpecificLogs = (table, filename) => {
    showModal({
      type: 'confirm',
      message: `¿Generar reporte de logs de la tabla ${table}?`,
      onConfirm: () => handleDownload(
        `${API_URL}/db-logs/export/pdf/table/${table}`,
        filename
      )
    });
  };

  const downloadSpecificUsers = (role, filename) => {
    showModal({
      type: 'confirm',
      message: `¿Generar reporte de usuarios con rol ${role}?`,
      onConfirm: () => handleDownload(
        `${API_URL}/users/export/pdf/role/${role}`,
        filename
      )
    });
  };

  return (
    <div className={styles.pdfTester}>
      <div className={styles.pdfTesterHeader}>
        <h1 className={styles.pdfTesterTitle}>Exportador de PDFs</h1>
        <p className={styles.pdfTesterSubtitle}>Genera reportes en PDF de la base de datos y usuarios</p>
      </div>

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}>Generando PDF...</div>
        </div>
      )}

      <div className={styles.pdfTesterContent}>
        {/* Sección 1: Logs de Base de Datos */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Bitácora de Base de Datos 
            <span className={`${styles.status} ${styles.statusActive}`}>Listo</span>
          </h2>
          <p className={styles.sectionDescription}>
            Exporta reportes completos de las operaciones registradas en la base de datos.
          </p>

          <div className={styles.buttonGrid}>
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => showModal({
                type: 'confirm',
                message: '¿Generar reporte completo de todos los logs?',
                onConfirm: () => handleDownload(
                  `${API_URL}/db-logs/export/pdf`,
                  'todos-los-logs.pdf'
                )
              })}
              disabled={loading}
            >
              Descargar Todos los Logs
            </button>
          </div>

          {/* Filtros */}
          <div className={styles.filterSection}>
            <h3>Filtrar Logs</h3>
            
            <div className={styles.filterGroup}>
              <label htmlFor="tableName">Tabla:</label>
              <select id="tableName">
                <option value="">Todas las tablas</option>
                <option value="Product">Product</option>
                <option value="Order">Order</option>
                <option value="User">User</option>
                <option value="Category">Category</option>
                <option value="Review">Review</option>
                <option value="Payment">Payment</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="action">Acción:</label>
              <select id="action">
                <option value="">Todas las acciones</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <button 
              className={`${styles.btn} ${styles.btnSuccess}`}
              onClick={downloadFilteredLogs}
              disabled={loading}
            >
              Descargar con Filtros
            </button>
          </div>

          {/* Logs por tabla específica */}
          <div className={styles.subSection}>
            <h3>Logs por Tabla Específica</h3>
            <div className={styles.buttonGrid}>
              <button 
                className={styles.btn}
                onClick={() => downloadSpecificLogs('Product', 'logs-productos.pdf')}
                disabled={loading}
              >
                Logs de Productos
              </button>
              <button 
                className={styles.btn}
                onClick={() => downloadSpecificLogs('Order', 'logs-ordenes.pdf')}
                disabled={loading}
              >
                Logs de Órdenes
              </button>
              <button 
                className={styles.btn}
                onClick={() => downloadSpecificLogs('User', 'logs-usuarios.pdf')}
                disabled={loading}
              >
                Logs de Usuarios
              </button>
              <button 
                className={styles.btn}
                onClick={() => downloadSpecificLogs('Category', 'logs-categorias.pdf')}
                disabled={loading}
              >
                Logs de Categorías
              </button>
            </div>
          </div>
        </div>

        {/* Sección 2: Usuarios */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Reportes de Usuarios 
            <span className={`${styles.status} ${styles.statusActive}`}>Listo</span>
          </h2>
          <p className={styles.sectionDescription}>
            Exporta reportes completos de los usuarios registrados en el sistema.
          </p>

          <div className={styles.buttonGrid}>
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => showModal({
                type: 'confirm',
                message: '¿Generar reporte completo de todos los usuarios?',
                onConfirm: () => handleDownload(
                  `${API_URL}/users/export/pdf`,
                  'todos-los-usuarios.pdf'
                )
              })}
              disabled={loading}
            >
              Descargar Todos los Usuarios
            </button>
          </div>

          {/* Usuarios por rol específico */}
          <div className={styles.subSection}>
            <h3>Usuarios por Rol Específico</h3>
            <div className={styles.buttonGrid}>
              <button 
                className={styles.btn}
                onClick={() => downloadSpecificUsers('ADMINISTRADOR', 'administradores.pdf')}
                disabled={loading}
              >
                Administradores
              </button>
              <button 
                className={styles.btn}
                onClick={() => downloadSpecificUsers('USUARIO', 'usuarios-clientes.pdf')}
                disabled={loading}
              >
                Usuarios/Clientes
              </button>
              <button 
                className={styles.btn}
                onClick={() => downloadSpecificUsers('TRABAJADOR', 'trabajadores.pdf')}
                disabled={loading}
              >
                Trabajadores
              </button>
            </div>
          </div>

          {/* Filtros por estado */}
          <div className={styles.filterSection}>
            <h3>Filtrar Usuarios</h3>
            
            <div className={styles.filterGroup}>
              <label htmlFor="userRole">Rol:</label>
              <select id="userRole">
                <option value="">Todos los roles</option>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="USUARIO">USUARIO</option>
                <option value="TRABAJADOR">TRABAJADOR</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="userStatus">Estado:</label>
              <select id="userStatus">
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>

            <button 
              className={`${styles.btn} ${styles.btnSuccess}`}
              onClick={downloadFilteredUsers}
              disabled={loading}
            >
              Descargar con Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={modal.show}
        type={modal.type}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onClose={closeModal}
        autoHide={modal.autoHide}
      />
    </div>
  );
};