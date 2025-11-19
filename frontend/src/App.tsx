import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Productos } from './pages/Productos';
import { Proveedores } from './pages/Proveedores';
import { Ventas } from './pages/Ventas';
import { Abonos } from './pages/Abonos';
import { EstadoCuentas } from './pages/EstadoCuentas';
import { PagosProveedores } from './pages/PagosProveedores';
import { Parametrizacion } from './pages/Parametrizacion';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/clientes" 
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ventas" 
          element={
            <ProtectedRoute>
              <Ventas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parametrizacion" 
          element={
            <ProtectedRoute>
              <Parametrizacion />
            </ProtectedRoute>
          } 
        />        
        <Route 
          path="/productos" 
          element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/proveedores" 
          element={
            <ProtectedRoute>
              <Proveedores />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pagos-proveedores" 
          element={
            <ProtectedRoute>
              <PagosProveedores />
            </ProtectedRoute>
          } 
        />        
        <Route 
          path="/abonos" 
          element={
            <ProtectedRoute>
              <Abonos />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/estado-cuentas" 
          element={
            <ProtectedRoute>
              <EstadoCuentas />
            </ProtectedRoute>
          } 
        />        
      </Routes>
    </Router>
  );
}

export default App;