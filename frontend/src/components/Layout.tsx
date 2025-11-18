import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const location = useLocation();

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/clientes', label: 'Clientes', icon: '👥' },
  { path: '/ventas', label: 'Ventas', icon: '💰' },
  { path: '/abonos', label: 'Abonos', icon: '💳' },
  { path: '/pagos-proveedores', label: 'Pagos Proveedores', icon: '🏦' },
  { path: '/estado-cuentas', label: 'Estado Cuentas', icon: '📋' },
  { path: '/productos', label: 'Productos', icon: '📦' },
  { path: '/proveedores', label: 'Proveedores', icon: '🏢' },
];

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>TiendaApp</h2>
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  <span style={{ marginRight: '10px' }}>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Contenido Principal */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <h1>{title}</h1>
          <div>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="btn"
              style={{ background: '#e74c3c', width: 'auto', padding: '8px 16px' }}
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Contenido */}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};