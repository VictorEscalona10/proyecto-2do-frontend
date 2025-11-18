import React, { useState } from 'react';
import "./UsersPage.css";

const API_URL = import.meta.env.VITE_API_URL;

// Función para buscar usuario
const searchUserByEmail = async (email) => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/users/search?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      credentials: 'include',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error buscando usuario:', error);
    throw error;
  }
};

// Función para eliminar usuario - CORREGIDA
const deleteUser = async (email) => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Usar el endpoint correcto con el email como query parameter
    const url = `${API_URL}/users/delete?email=${encodeURIComponent(email)}`;
    console.log('🌐 URL de DELETE:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: headers,
    });
    
    console.log('📡 Respuesta del servidor - Status:', response.status, response.statusText);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('No tienes permisos para eliminar usuarios');
      }
      if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    return { success: true, message: 'Usuario eliminado correctamente' };
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    throw error;
  }
};

// Componente Users
export const Users = () => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Buscar usuario
  const handleSearch = async () => {
    if (!email) {
      setMessage('Por favor ingresa un email');
      return;
    }

    setLoading(true);
    setMessage('');
    setUser(null);
    
    try {
      const userData = await searchUserByEmail(email);
      
      if (!userData) {
        setMessage('No se recibieron datos del servidor');
        return;
      }

      // Manejar diferentes estructuras de respuesta
      let userToShow = userData;
      
      if (Array.isArray(userData) && userData.length > 0) {
        userToShow = userData[0];
      } else if (userData.data) {
        userToShow = userData.data;
      }

      console.log('Usuario recibido:', userToShow);
      setUser(userToShow);
      setMessage(`✅ Usuario encontrado: ${userToShow.email}`);
      
    } catch (error) {
      if (error.message.includes('403')) {
        setMessage('Error de permisos: No tienes acceso para realizar esta acción');
      } else if (error.message.includes('404')) {
        setMessage('Usuario no encontrado');
      } else {
        setMessage('Error al buscar usuario: ' + error.message);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario - SIMPLIFICADA
  const handleDelete = async () => {
    if (!user || !user.email) {
      setMessage('No hay usuario seleccionado para eliminar');
      return;
    }

    console.log('🗑️ Eliminando usuario con email:', user.email);

    // Confirmación de eliminación
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.email}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    setDeleteLoading(true);
    setMessage('');
    
    try {
      await deleteUser(user.email);
      setMessage('✅ Usuario eliminado correctamente');
      setUser(null);
      setEmail('');
    } catch (error) {
      setMessage(`❌ Error al eliminar usuario: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Función para obtener el valor de diferentes nombres de campo posibles
  const getFieldValue = (fieldNames) => {
    if (!user) return 'No disponible';
    
    for (let fieldName of fieldNames) {
      if (user[fieldName] !== undefined && user[fieldName] !== null && user[fieldName] !== '') {
        return user[fieldName];
      }
    }
    return 'No disponible';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Función para obtener clase de mensaje
  const getMessageClass = () => {
    if (message.includes('Error')) return 'message-error';
    if (message.includes('eliminado')) return 'message-success';
    return 'message-warning';
  };

  return (
    <div className="users-page">
      <h2>👥 Gestión de Usuarios</h2>
      
      {/* Panel de búsqueda */}
      <div className="search-panel">
        <h3>🔍 Buscar Usuario</h3>
        <p className="search-description">
          Ingresa el email del usuario que deseas buscar en el sistema
        </p>
        
        <div className="search-input-group">
          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="search-btn"
          >
            {loading ? '⏳ Buscando...' : '🔍 Buscar Usuario'}
          </button>
        </div>
      </div>

      {/* Mostrar información del usuario */}
      {user && (
        <div className="user-card">
          <h3 className="user-header">
            📋 Información del Usuario
          </h3>
          
          <div className="user-grid">
            {/* Columna 1 - Información básica */}
            <div className="info-section">
              <h4>Información Básica</h4>
              
              <div className="info-field">
                <strong>📧 Email:</strong>
                <div className="field-value">
                  {user.email || 'No disponible'}
                </div>
              </div>
              
              <div className="info-field">
                <strong>👤 Nombre Completo:</strong>
                <div className="field-value">
                  {user.name || 'No disponible'}
                </div>
              </div>
              
              <div className="info-field">
                <strong>🆔 Cédula de Identidad:</strong>
                <div className="field-value identification">
                  {getFieldValue(['identification', 'cedula', 'dni', 'document', 'documentNumber'])}
                </div>
              </div>
            </div>

            {/* Columna 2 - Información de contacto */}
            <div className="info-section">
              <h4>Información de Contacto</h4>
              
              <div className="info-field">
                <strong>📞 Teléfono:</strong>
                <div className="field-value phone">
                  {getFieldValue(['phoneNumber', 'phone', 'telefono', 'telephone', 'cellphone', 'mobile'])}
                </div>
              </div>
              
              <div className="info-field">
                <strong>🔐 Estado de Cuenta:</strong>
                <div className={`field-value ${user.isActive === false ? 'status-inactive' : 'status-active'}`}>
                  {user.isActive === false ? '❌ Inactiva' : '✅ Activa'}
                </div>
              </div>
              
              <div className="info-field">
                <strong>👑 Rol:</strong>
                <div className={`field-value ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                  {user.role ? user.role.toUpperCase() : 'USER'}
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="additional-info">
            <h4>Información Adicional</h4>
            
            {/* Mostrar todos los campos disponibles para debug */}
            <details className="debug-section">
              <summary className="debug-summary">
                🔍 Ver todos los campos disponibles (Debug)
              </summary>
              <div className="debug-content">
                {Object.entries(user).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {JSON.stringify(value)}
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Botón de eliminar */}
          <div className="danger-zone">
            <h4>🚨 Zona de Peligro</h4>
            <button 
              onClick={handleDelete}
              disabled={deleteLoading}
              className="delete-btn"
            >
              {deleteLoading ? '⏳ Eliminando...' : '🗑️ Eliminar Usuario Permanentemente'}
            </button>
            <p className="delete-warning">
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
            </p>
          </div>
        </div>
      )}

      {/* Mensajes del sistema */}
      {message && (
        <div className={`system-message ${getMessageClass()}`}>
          {message}
        </div>
      )}
    </div>
  );
};