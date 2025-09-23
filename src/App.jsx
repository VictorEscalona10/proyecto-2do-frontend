import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';

import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import Forgot_Password from './pages/Forgot_Password/Forgot_Password.jsx';
import Reset_Password from './pages/Reset_Password/Reset_Password.jsx';

function App() {
  return (
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
  );
}

export default App;