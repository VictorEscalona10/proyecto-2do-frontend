import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
// Agregar esta importación
import { OrderPage } from "./components/pages/Orders/Orders.jsx";

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [modal, setModal] = useState(null);

  const showModal = (modalData) => {
    setModal(modalData);
  };

  const closeModal = () => {
    setModal(null);
  };

  // proteger acceso a role si user es undefined/null
  if (user?.role === 'ADMINISTRADOR') {
    return (
      <CartProvider>
        <Router>
          <AdminDashboard onShowModal={showModal} />
          {modal && (
            <Modal
              type={modal.type}
              message={modal.message}
              onConfirm={modal.onConfirm}
              onClose={closeModal}
            />
          )}
        </Router>
      </CartProvider>
    );
  }

  if (user?.role === 'TRABAJADOR') {
    return (
      <CartProvider>
        <Router>
          <WorkerDashboard onShowModal={showModal} />
          {modal && (
            <Modal
              type={modal.type}
              message={modal.message}
              onConfirm={modal.onConfirm}
              onClose={closeModal}
            />
          )}
        </Router>
      </CartProvider>
    );
  }
  
  return (
    <CartProvider>
      <Router>
        <Header onShowModal={showModal} />
        <Routes>
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
          {/* Agregar esta ruta */}
          <Route path="/my-orders" element={<OrderPage onShowModal={showModal} />} />
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
      </Router>
    </CartProvider>
  );
}

export default App;