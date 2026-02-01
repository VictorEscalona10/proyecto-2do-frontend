// App.jsx - Versión CORREGIDA
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";
import { useState } from "react";
import Header from "./Header.jsx";
import { useAuth } from "./hooks/useAuth.jsx";
import Modal from "./components/pages/Modal/Modal.jsx";

import Home from "./components/pages/Home/Home.jsx";
import Login from "./components/pages/Login/Login.jsx";
import About from "./components/pages/About/About.jsx";
import Register from "./components/pages/Register/Register.jsx";
import Forgot_Password from "./components/pages/Forgot_Password/Forgot_Password.jsx";
import Reset_Password from "./components/pages/Reset_Password/Reset_Password.jsx";
import Products from "./components/pages/Products/Products.jsx";
import { AdminDashboard } from "./components/Admin/AdminDashboard.jsx";
import { WorkerDashboard } from "./components/Worker/WorkerDashboard.jsx";
import {ProductDetail} from "./components/pages/Products/ProductDetail.jsx";
import { CustomCakeBuilder } from "./components/pages/customCake/CustomCake.jsx";
import { OrderPage } from "./components/pages/Orders/Orders.jsx";

// Importar componentes de chat
import { ChatBubble } from "./components/pages/ChatBubble/Chatbubble.jsx";

// Componente de ruta protegida
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading-page">Cargando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [modal, setModal] = useState(null);

  const showModal = (modalData) => {
    setModal(modalData);
  };

  const closeModal = () => {
    setModal(null);
  };

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="loading-page">
        <div>Cargando aplicación...</div>
      </div>
    );
  }

  return (
    <CartProvider>
      <Router>
        {/* Header solo para rutas públicas */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="/worker/*" element={null} />
          <Route path="*" element={<Header onShowModal={showModal} />} />
        </Routes>
        
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home onShowModal={showModal} />} />
          <Route path="/login" element={<Login onShowModal={showModal} />} />
          <Route path="/register" element={<Register onShowModal={showModal} />} />
          <Route path="/forgot_password" element={<Forgot_Password onShowModal={showModal} />} />
          <Route path="/reset_password" element={<Reset_Password onShowModal={showModal} />} />
          <Route path="/reset-password" element={<Reset_Password onShowModal={showModal} />} />
          <Route path="/products" element={<Products onShowModal={showModal} />} />
          <Route path="/About" element={<About onShowModal={showModal} />} />
          <Route path="/product/:name" element={<ProductDetail onShowModal={showModal} />} />
          <Route path="/custom-cake" element={<CustomCakeBuilder onShowModal={showModal} />} />
          
          {/* Rutas protegidas para USUARIOS normales */}
          <Route path="/my-orders" element={
            <ProtectedRoute allowedRoles={['USUARIO']}>
              <OrderPage onShowModal={showModal} />
            </ProtectedRoute>
          } />
          
          {/* RUTA DE ADMINISTRADOR - ESTA ES LA CLAVE */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard onShowModal={showModal} />
            </ProtectedRoute>
          } />
          
          {/* RUTA DE TRABAJADOR */}
          <Route path="/worker/*" element={
            <ProtectedRoute allowedRoles={['TRABAJADOR']}>
              <WorkerDashboard onShowModal={showModal} />
            </ProtectedRoute>
          } />
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Modal global */}
        {modal && (
          <Modal
            type={modal.type}
            message={modal.message}
            onConfirm={modal.onConfirm}
            onClose={closeModal}
          />
        )}

        {/* Mostrar burbuja de chat para usuarios autenticados con rol USUARIO */}
        {isAuthenticated && user?.role === 'USUARIO' && <ChatBubble user={user} />}
      </Router>
    </CartProvider>
  );
}

export default App;