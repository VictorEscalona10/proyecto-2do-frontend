import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";
import Header from "./Header.jsx";
import { useAuth } from "./hooks/useAuth.jsx";

import Home from "./components/pages/Home/Home.jsx";
import Login from "./components/pages/Login/Login.jsx";
import About from "./components/pages/About/About.jsx";
import Register from "./components/pages/Register/Register.jsx";
import Forgot_Password from "./components/pages/Forgot_Password/Forgot_Password.jsx";
import Reset_Password from "./components/pages/Reset_Password/Reset_Password.jsx";
import Products from "./components/pages/Products/Products.jsx";
import { AdminDashboard } from "./components/Admin/AdminDashboard.jsx";

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // proteger acceso a role si user es undefined/null
  if (user?.role === 'ADMINISTRADOR') {
    // envolver en providers/router si quieres mantener contexto y routing para admin
    return (
      <CartProvider>
        <Router>
          <AdminDashboard />
        </Router>
      </CartProvider>
    );
  }
  
  return (
    <CartProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot_password" element={<Forgot_Password />} />
          <Route path="/reset_password" element={<Reset_Password />} />
          <Route path="/reset-password" element={<Reset_Password />} />
          <Route path="/products" element={<Products />} />
          <Route path="/About" element={<About />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}
// ...existing code...
export default App;