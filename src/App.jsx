import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';

import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;