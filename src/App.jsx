import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import Header from './Header.jsx';

import Home from './components/pages/Home/Home.jsx';
import Login from './components/pages/Login/Login.jsx';
import Register from './components/pages/Register/Register.jsx';
import Forgot_Password from './components/pages/Forgot_Password/Forgot_Password.jsx';
import Reset_Password from './components/pages/Reset_Password/Reset_Password.jsx';

function App() {
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
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;