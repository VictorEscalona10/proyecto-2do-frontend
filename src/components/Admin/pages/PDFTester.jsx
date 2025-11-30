import React, { useState } from 'react';
import './PDFTester.module.css';

export const PDFTester = () => {
  const API_URL = 'http://localhost:3000';
  const [loading, setLoading] = useState(false);

  const handleDownload = async (url, filename) => {
    try {
      setLoading(true);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Simular un pequeño delay para feedback visual
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      console.error('Error descargando PDF:', error);
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
    handleDownload(url, `logs-filtrado-${Date.now()}.pdf`);
  };

  const downloadFilteredUsers = () => {
    const role = document.getElementById('userRole')?.value || '';
    const isActive = document.getElementById('userStatus')?.value || '';

    let url = `${API_URL}/users/export/pdf?`;
    const params = [];
    if (role) params.push(`role=${role}`);
    if (isActive) params.push(`isActive=${isActive}`);
    
    url += params.join('&');
    handleDownload(url, `usuarios-filtrado-${Date.now()}.pdf`);
  };

  return (
    <div className="pdf-tester">
      <div className="pdf-tester-header">
        <h1 className="pdf-tester-title">📊 Exportador de PDFs</h1>
        <p className="pdf-tester-subtitle">Genera reportes en PDF de la base de datos y usuarios</p>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">⏳ Generando PDF...</div>
        </div>
      )}

      <div className="pdf-tester-content">
        {/* Información */}

        {/* Sección 1: Logs de Base de Datos */}
        <div className="section">
          <h2 className="section-title">
            📊 Bitácora de Base de Datos 
            <span className="status status-active">✓ Listo</span>
          </h2>
          <p className="section-description">
            Exporta reportes completos de las operaciones registradas en la base de datos.
          </p>

          <div className="button-grid">
            <button 
              className="btn btn-primary"
              onClick={() => handleDownload(
                `${API_URL}/db-logs/export/pdf`,
                'todos-los-logs.pdf'
              )}
              disabled={loading}
            >
              📄 Descargar Todos los Logs
            </button>
          </div>

          {/* Filtros */}
          <div className="filter-section">
            <h3>Filtrar Logs</h3>
            
            <div className="filter-group">
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

            <div className="filter-group">
              <label htmlFor="action">Acción:</label>
              <select id="action">
                <option value="">Todas las acciones</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <button 
              className="btn btn-success"
              onClick={downloadFilteredLogs}
              disabled={loading}
            >
              🔍 Descargar con Filtros
            </button>
          </div>

          {/* Logs por tabla específica */}
          <div className="sub-section">
            <h3>Logs por Tabla Específica</h3>
            <div className="button-grid">
              <button 
                className="btn"
                onClick={() => handleDownload(
                  `${API_URL}/db-logs/export/pdf/table/Product`,
                  'logs-productos.pdf'
                )}
                disabled={loading}
              >
                🛍️ Logs de Productos
              </button>
              <button 
                className="btn"
                onClick={() => handleDownload(
                  `${API_URL}/db-logs/export/pdf/table/Order`,
                  'logs-ordenes.pdf'
                )}
                disabled={loading}
              >
                📦 Logs de Órdenes
              </button>
              <button 
                className="btn"
                onClick={() => handleDownload(
                  `${API_URL}/db-logs/export/pdf/table/User`,
                  'logs-usuarios.pdf'
                )}
                disabled={loading}
              >
                👥 Logs de Usuarios
              </button>
              <button 
                className="btn"
                onClick={() => handleDownload(
                  `${API_URL}/db-logs/export/pdf/table/Category`,
                  'logs-categorias.pdf'
                )}
                disabled={loading}
              >
                🏷️ Logs de Categorías
              </button>
            </div>
          </div>
        </div>

        {/* Sección 2: Usuarios */}
        <div className="section">
          <h2 className="section-title">
            👥 Reportes de Usuarios 
            <span className="status status-active">✓ Listo</span>
          </h2>
          <p className="section-description">
            Exporta reportes completos de los usuarios registrados en el sistema.
          </p>

          <div className="button-grid">
            <button 
              className="btn btn-primary"
              onClick={() => handleDownload(
                `${API_URL}/users/export/pdf`,
                'todos-los-usuarios.pdf'
              )}
              disabled={loading}
            >
              📄 Descargar Todos los Usuarios
            </button>
          </div>

          {/* Usuarios por rol específico */}
          <div className="sub-section">
            <h3>Usuarios por Rol Específico</h3>
            <div className="button-grid">
              <button 
                className="btn"
                onClick={() => handleDownload(
                  `${API_URL}/users/export/pdf/role/ADMINISTRADOR`,
                  'administradores.pdf'
                )}
                disabled={loading}
              >
                👨‍💼 Administradores
              </button>
              <button 
                className="btn"
                onClick={() => handleDownload(
                  `${API_URL}/users/export/pdf/role/USUARIO`,
                  'usuarios-clientes.pdf'
                )}
                disabled={loading}
              >
                👤 Usuarios/Clientes
              </button>
              <button 
                className="btn"
                onClick={() => handleDownload(
                  `${API_URL}/users/export/pdf/role/TRABAJADOR`,
                  'trabajadores.pdf'
                )}
                disabled={loading}
              >
                👷 Trabajadores
              </button>
            </div>
          </div>

          {/* Filtros por estado */}
          <div className="filter-section">
            <h3>Filtrar Usuarios</h3>
            
            <div className="filter-group">
              <label htmlFor="userRole">Rol:</label>
              <select id="userRole">
                <option value="">Todos los roles</option>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="USUARIO">USUARIO</option>
                <option value="TRABAJADOR">TRABAJADOR</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="userStatus">Estado:</label>
              <select id="userStatus">
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>

            <button 
              className="btn btn-success"
              onClick={downloadFilteredUsers}
              disabled={loading}
            >
              🔍 Descargar con Filtros
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};