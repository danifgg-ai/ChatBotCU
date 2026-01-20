import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppUser from './AppUser';
import AppAdmin from './AppAdmin';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Usuario - Interfaz Simple */}
        <Route path="/" element={<AppUser />} />
        
        {/* Ruta Admin - Dashboard Completo */}
        <Route path="/admin/*" element={<AppAdmin />} />
        
        {/* Redireccionar rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;