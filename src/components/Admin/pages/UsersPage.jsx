import React, { useState, useEffect } from 'react';
import "./UsersPage.css";

const API_URL = import.meta.env.VITE_API_URL;

// Funciones de API (mantener igual)
const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      credentials: 'include',
      headers: headers,
    });
    
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw error;
  }
};

const searchUsers = async (searchTerm, searchType) => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const queryParams = new URLSearchParams();
    if (searchType === 'email') {
      queryParams.append('email', searchTerm);
    } else if (searchType === 'name') {
      queryParams.append('name', searchTerm);
    } else if (searchType === 'Identification') {
      queryParams.append('Identification', searchTerm);
    }

    const response = await fetch(`${API_URL}/users/search?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: headers,
    });
    
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Error buscando usuarios:', error);
    throw error;
  }
};

const updateUserRole = async (email, role) => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/users/update-role`, {
      method: 'PATCH',
      credentials: 'include',
      headers: headers,
      body: JSON.stringify({ email, role }),
    });
    
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Error actualizando rol:', error);
    throw error;
  }
};

const deleteUser = async (email) => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/users/delete?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: headers,
    });
    
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return { success: true, message: 'Usuario eliminado correctamente' };
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    throw error;
  }
};

// Componente UserCard individual
const UserCard = ({ user, onUpdateRole, onDeleteUser, actionLoading, onShowModal }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (isActive) => {
    return isActive ? 'active' : 'inactive';
  };

  const getRoleClass = (role) => {
    return role === 'ADMINISTRADOR' ? 'role-admin' : 
           role === 'TRABAJADOR' ? 'role-worker' : 'role-user';
  };

  const handleRoleChange = (email, newRole) => {
    onShowModal({
      type: 'confirm',
      message: `¿Estás seguro de cambiar el rol de ${user.name} a ${newRole}?`,
      onConfirm: () => onUpdateRole(email, newRole)
    });
  };

  const handleDeleteClick = (email, name) => {
    onShowModal({
      type: 'confirm',
      message: `¿Estás seguro de eliminar al usuario ${name}? Esta acción no se puede deshacer.`,
      onConfirm: () => onDeleteUser(email, name)
    });
  };

  return (
    <div className={`user-card ${isExpanded ? 'expanded' : ''}`}>
      {/* Header desplegable */}
      <div 
        className="user-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="user-header-main">
          <h4>👤 {user.name}</h4>
          <span className={`status-badge ${getStatusClass(user.isActive)}`}>
            {user.isActive ? '✅ Activo' : '❌ Inactivo'}
          </span>
        </div>
        <div className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>

      {/* Contenido desplegable */}
      {isExpanded && (
        <div className="user-content">
          <div className="user-details">
            <div className="detail-row">
              <strong>📧 Email:</strong> {user.email}
            </div>
            <div className="detail-row">
              <strong>🆔 Cédula:</strong> {user.Identification}
            </div>
            <div className="detail-row">
              <strong>📞 Teléfono:</strong> {user.phoneNumber}
            </div>
            <div className="detail-row">
              <strong>👑 Rol:</strong>
              <span className={`role-badge ${getRoleClass(user.role)}`}>
                {user.role}
              </span>
            </div>
            <div className="detail-row">
              <strong>📅 Registro:</strong> {formatDate(user.createdAt)}
            </div>
          </div>

          <div className="user-actions">
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(user.email, e.target.value)}
              disabled={actionLoading}
              className="role-select"
            >
              <option value="USUARIO">Usuario</option>
              <option value="TRABAJADOR">Trabajador</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
            
            <button
              onClick={() => handleDeleteClick(user.email, user.name)}
              disabled={actionLoading}
              className="delete-btn"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Modal
const Modal = ({ show, type, message, onConfirm, onClose }) => {
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${type}`}>
          <h3>{getModalTitle()}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
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

// Componente Users principal
export const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'search'
  
  // Estados para modal
  const [modal, setModal] = useState({
    show: false,
    type: 'info', // 'success', 'error', 'warning', 'confirm'
    message: '',
    onConfirm: null
  });
  
  // Estados para búsqueda minimalista
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('email'); // 'email', 'name', 'Identification'

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadAllUsers();
  }, []);

  const showModal = (modalConfig) => {
    setModal({
      show: true,
      type: modalConfig.type || 'info',
      message: modalConfig.message,
      onConfirm: modalConfig.onConfirm
    });
    
    // Auto-cerrar solo para alertas satisfactorias después de 2 segundos
    if (modalConfig.type === 'success') {
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
      onConfirm: null
    });
  };

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    // Auto-ocultar mensajes después de 5 segundos
    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const loadAllUsers = async () => {
    setLoading(true);
    setMessage('');
    try {
      const usersData = await getAllUsers();
      setUsers(usersData.data || []);
      setFilteredUsers(usersData.data || []);
    } catch (error) {
      showMessage(`Error al cargar usuarios: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      showMessage('Por favor ingresa un término de búsqueda', 'warning');
      return;
    }

    setSearchLoading(true);
    setMessage('');
    try {
      const searchResult = await searchUsers(searchTerm, searchType);
      setFilteredUsers(searchResult.data || []);
      showMessage(`✅ ${searchResult.count || searchResult.data.length} usuario(s) encontrado(s)`, 'success');
    } catch (error) {
      if (error.message.includes('404')) {
        showMessage('No se encontraron usuarios con los criterios especificados', 'warning');
        setFilteredUsers([]);
      } else {
        showMessage(`Error al buscar usuarios: ${error.message}`, 'error');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUpdateRole = async (email, newRole) => {
    setActionLoading(true);
    setMessage('');
    try {
      await updateUserRole(email, newRole);
      showMessage(`✅ Rol actualizado correctamente a ${newRole}`, 'success');
      // Actualizar la lista local
      const updatedUsers = users.map(user => 
        user.email === email ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      showMessage(`❌ Error al actualizar rol: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (email, name) => {
    setActionLoading(true);
    setMessage('');
    try {
      await deleteUser(email);
      showMessage('✅ Usuario eliminado correctamente', 'success');
      // Recargar la lista
      loadAllUsers();
    } catch (error) {
      showMessage(`❌ Error al eliminar usuario: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredUsers(users);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getMessageClass = () => {
    if (message.includes('Error') || message.includes('❌')) return 'message-error';
    if (message.includes('actualizado') || message.includes('eliminado') || message.includes('✅')) return 'message-success';
    return 'message-warning';
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'email': return '📧 Buscar por email...';
      case 'name': return '👤 Buscar por nombre...';
      case 'Identification': return '🆔 Buscar por cédula...';
      default: return 'Buscar usuarios...';
    }
  };

  return (
    <div className="users-page">
      <h2>👥 Gestión de Usuarios</h2>
      
      {/* Tabs de navegación */}
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Lista de Usuarios
        </button>
        <button 
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Buscar Usuarios
        </button>
      </div>

      {/* Mensajes del sistema */}
      {message && (
        <div className={`system-message ${getMessageClass()}`}>
          {message}
        </div>
      )}

      {/* Panel de Lista */}
      {activeTab === 'list' && (
        <div className="list-panel">
          <div className="panel-header">
            <h3>📋 Todos los Usuarios ({users.length})</h3>
            <button 
              onClick={loadAllUsers}
              disabled={loading}
              className="refresh-btn"
            >
              {loading ? '⏳ Cargando...' : '🔄 Actualizar Lista'}
            </button> 
          </div>

          {loading ? (
            <div className="loading-state">⏳ Cargando usuarios...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p>📭 No hay usuarios registrados</p>
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onUpdateRole={handleUpdateRole}
                  onDeleteUser={handleDeleteUser}
                  actionLoading={actionLoading}
                  onShowModal={showModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel de Búsqueda Minimalista */}
      {activeTab === 'search' && (
        <div className="search-panel">
          <h3>🔍 Buscar Usuarios</h3>
          
          {/* Búsqueda minimalista */}
          <div className="minimal-search">
            <div className="search-controls">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="search-type-select"
              >
                <option value="email">📧 Email</option>
                <option value="name">👤 Nombre</option>
                <option value="Identification">🆔 Cédula</option>
              </select>
              
              <div className="search-input-wrapper">
                <input
                  type={searchType === 'Identification' ? 'number' : 'text'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={getSearchPlaceholder()}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    onClick={clearSearch}
                    className="clear-search-btn"
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <button 
                onClick={handleSearch}
                disabled={searchLoading}
                className="search-btn"
              >
                {searchLoading ? '⏳' : '🔍'}
              </button>
            </div>
          </div>

          {/* Resultados de búsqueda */}
          {filteredUsers.length > 0 ? (
            <div className="search-results">
              <div className="results-header">
                <h4>📊 Resultados encontrados: {filteredUsers.length}</h4>
                <button 
                  onClick={clearSearch}
                  className="clear-results-btn"
                >
                  🔄 Mostrar todos
                </button>
              </div>
              
              <div className="users-grid">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onUpdateRole={handleUpdateRole}
                    onDeleteUser={handleDeleteUser}
                    actionLoading={actionLoading}
                    onShowModal={showModal}
                  />
                ))}
              </div>
            </div>
          ) : searchTerm && !searchLoading ? (
            <div className="no-results">
              <p>🔍 No se encontraron usuarios</p>
              <p>Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="search-info">
              <p>💡 Selecciona un tipo de búsqueda e ingresa el término para buscar usuarios</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Personalizado */}
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