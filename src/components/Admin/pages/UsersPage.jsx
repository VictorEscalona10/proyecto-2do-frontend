import React, { useState } from 'react';

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

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>👥 Gestión de Usuarios</h2>
      
      {/* Panel de búsqueda */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        backgroundColor: 'white', 
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, color: '#495057' }}>🔍 Buscar Usuario</h3>
        <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '15px' }}>
          Ingresa el email del usuario que deseas buscar en el sistema
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              padding: '12px',
              flex: 1,
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px',
              minWidth: '250px'
            }}
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Buscando...' : '🔍 Buscar Usuario'}
          </button>
        </div>
      </div>

      {/* Mostrar información del usuario */}
      {user && (
        <div style={{
          border: '1px solid #ddd',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: '#f8f9fa',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            color: '#333', 
            borderBottom: '2px solid #007bff', 
            paddingBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📋 Información del Usuario
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Columna 1 - Información básica */}
            <div>
              <h4 style={{ color: '#495057', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '5px' }}>
                Información Básica
              </h4>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>📧 Email:</strong>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'white', 
                  borderRadius: '4px', 
                  marginTop: '5px',
                  border: '1px solid #dee2e6'
                }}>
                  {user.email || 'No disponible'}
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>👤 Nombre Completo:</strong>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'white', 
                  borderRadius: '4px', 
                  marginTop: '5px',
                  border: '1px solid #dee2e6'
                }}>
                  {user.name || 'No disponible'}
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>🆔 Cédula de Identidad:</strong>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'white', 
                  borderRadius: '4px', 
                  marginTop: '5px',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  color: '#28a745'
                }}>
                  {getFieldValue(['identification', 'cedula', 'dni', 'document', 'documentNumber'])}
                </div>
              </div>
            </div>

            {/* Columna 2 - Información de contacto */}
            <div>
              <h4 style={{ color: '#495057', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '5px' }}>
                Información de Contacto
              </h4>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>📞 Teléfono:</strong>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'white', 
                  borderRadius: '4px', 
                  marginTop: '5px',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  color: '#007bff'
                }}>
                  {getFieldValue(['phoneNumber', 'phone', 'telefono', 'telephone', 'cellphone', 'mobile'])}
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>🔐 Estado de Cuenta:</strong>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'white', 
                  borderRadius: '4px', 
                  marginTop: '5px',
                  border: '1px solid #dee2e6',
                  color: user.isActive === false ? '#dc3545' : '#28a745',
                  fontWeight: 'bold'
                }}>
                  {user.isActive === false ? '❌ Inactiva' : '✅ Activa'}
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>👑 Rol:</strong>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'white', 
                  borderRadius: '4px', 
                  marginTop: '5px',
                  border: '1px solid #dee2e6',
                  color: user.role === 'admin' ? '#dc3545' : '#007bff',
                  fontWeight: 'bold'
                }}>
                  {user.role ? user.role.toUpperCase() : 'USER'}
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div style={{ 
            marginTop: '20px', 
            paddingTop: '20px', 
            borderTop: '1px solid #dee2e6'
          }}>
            <h4 style={{ color: '#495057', marginBottom: '15px' }}>Información Adicional</h4>
            
            {/* Mostrar todos los campos disponibles para debug */}
            <details style={{ marginBottom: '15px' }}>
              <summary style={{ cursor: 'pointer', color: '#6c757d', fontSize: '14px' }}>
                🔍 Ver todos los campos disponibles (Debug)
              </summary>
              <div style={{ 
                marginTop: '10px', 
                padding: '10px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                {Object.entries(user).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {JSON.stringify(value)}
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Botón de eliminar */}
          <div style={{ 
            marginTop: '25px', 
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '2px solid #dc3545'
          }}>
            <h4 style={{ color: '#dc3545', marginBottom: '15px' }}>🚨 Zona de Peligro</h4>
            <button 
              onClick={handleDelete}
              disabled={deleteLoading}
              style={{
                padding: '12px 30px',
                backgroundColor: deleteLoading ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: deleteLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)'
              }}
            >
              {deleteLoading ? '⏳ Eliminando...' : '🗑️ Eliminar Usuario Permanentemente'}
            </button>
            <p style={{ 
              color: '#6c757d', 
              fontSize: '12px', 
              marginTop: '10px',
              fontStyle: 'italic'
            }}>
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
            </p>
          </div>
        </div>
      )}

      {/* Mensajes del sistema */}
      {message && (
        <div style={{
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: message.includes('Error') ? '#f8d7da' : 
                          message.includes('eliminado') ? '#d4edda' : '#fff3cd',
          color: message.includes('Error') ? '#721c24' : 
                message.includes('eliminado') ? '#155724' : '#856404',
          border: `1px solid ${message.includes('Error') ? '#f5c6cb' : 
                              message.includes('eliminado') ? '#c3e6cb' : '#ffeaa7'}`,
          marginTop: '10px',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};