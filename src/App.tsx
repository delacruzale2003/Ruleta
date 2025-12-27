import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/Ruleta';
import ExitPage from './pages/ExitPage';
 // Asumo que este es tu componente
import './App.css';
import Tienda from './pages/Tiendas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ⚠️ IMPORTANTE: Las rutas específicas van PRIMERO */}
        
        {/* 1. Ruta de Configuración / Selección de Tienda */}
        <Route path="/tiendas" element={<Tienda />} />

        {/* 2. Ruta de Salida */}
        <Route path="/exit" element={<ExitPage />} />

        {/* 3. Ruta Dinámica (El juego). 
            Al ir al final, atrapa todo lo que no sea 'tiendas' o 'exit' 
            (ej: /105, /sodimac-jockey, etc.) 
        */}
        <Route path="/:storeId" element={<RegisterPage />} />

        {/* 4. Redirección por defecto si entran a la raíz sin ID */}
        <Route path="/" element={<Navigate to="/tiendas" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;