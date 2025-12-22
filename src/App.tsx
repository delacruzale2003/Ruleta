
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import RegisterPage from './pages/RegisterPage'
import ExitPage from './pages/ExitPage';

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* 👈 DECLARAS EL PARÁMETRO DE RUTA */}
      <Route path="/" element={<RegisterPage />} /> 
      <Route path="/exit" element={<ExitPage />} />
    </Routes>
  </BrowserRouter>
);

export default App
