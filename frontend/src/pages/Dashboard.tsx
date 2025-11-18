import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

interface DashboardData {
  ventasHoy: { total: number; count: number };
  clientesActivos: number;
  ventasPendientes: number;
  totalProductos: number;
  ventasRecientes: any[];
  pendientes: any[];
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    ventasHoy: { total: 0, count: 0 },
    clientesActivos: 0,
    ventasPendientes: 0,
    totalProductos: 0,
    ventasRecientes: [],
    pendientes: []
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      // Cargar datos en paralelo
      const [
        ventasHoyRes,
        clientesRes,
        pendientesRes,
        productosRes,
        ventasRecientesRes
      ] = await Promise.all([
        api.get('/ventas/hoy/estadisticas'),
        api.get('/clientes'),
        api.get('/ventas/pendientes'),
        api.get('/productos'),
        api.get('/ventas')
      ]);

      setData({
        ventasHoy: ventasHoyRes.data,
        clientesActivos: clientesRes.data.length,
        ventasPendientes: pendientesRes.data.length,
        totalProductos: productosRes.data.length,
        ventasRecientes: ventasRecientesRes.data.slice(0, 5),
        pendientes: pendientesRes.data.slice(0, 5)
      });
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="card">
          <p>Cargando dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Ventas Hoy</h3>
          <div className="number">${data.ventasHoy.total.toLocaleString()}</div>
          <small>{data.ventasHoy.count} ventas</small>
        </div>
        <div className="stat-card">
          <h3>Clientes Activos</h3>
          <div className="number">{data.clientesActivos}</div>
        </div>
        <div className="stat-card">
          <h3>Pendientes</h3>
          <div className="number" style={{ color: '#e74c3c' }}>{data.ventasPendientes}</div>
        </div>
        <div className="stat-card">
          <h3>Productos</h3>
          <div className="number">{data.totalProductos}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Ventas Recientes */}
        <div className="card">
          <h2>Ventas Recientes</h2>
          {data.ventasRecientes.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px' }}>Cliente</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px' }}>Valor</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px' }}>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ventasRecientes.map((venta) => (
                    <tr key={venta.id}>
                      <td style={{ padding: '8px', fontSize: '14px' }}>{venta.cliente_nombre || 'Sin cliente'}</td>
                      <td style={{ padding: '8px', fontSize: '14px' }}>${venta.valor_total.toLocaleString()}</td>
                      <td style={{ padding: '8px', fontSize: '14px' }}>
                        <span style={{
                          background: venta.tipo_venta === 'contado' ? '#27ae60' : 
                                    venta.tipo_venta === 'credito' ? '#3498db' : '#f39c12',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px'
                        }}>
                          {venta.tipo_venta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No hay ventas recientes
            </p>
          )}
        </div>

        {/* Alertas de Pendientes */}
        <div className="card">
          <h2 style={{ color: '#e74c3c' }}>⚠️ Pendientes por Cobrar</h2>
          {data.pendientes.length > 0 ? (
            <div>
              {data.pendientes.map((pendiente) => (
                <div key={pendiente.id} style={{
                  padding: '10px',
                  border: '1px solid #f39c12',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  background: '#fef9e7'
                }}>
                  <div style={{ fontWeight: 'bold' }}>
                    {pendiente.cliente_nombre || 'Cliente no registrado'}
                  </div>
                  <div>${pendiente.valor_total.toLocaleString()} - {pendiente.descripcion}</div>
                  <small style={{ color: '#7f8c8d' }}>
                    {new Date(pendiente.fecha).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No hay pendientes por cobrar
            </p>
          )}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="card">
        <h2>Acciones Rápidas</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn" 
            onClick={() => window.location.href = '/ventas'}
            style={{ width: 'auto', background: '#27ae60' }}
          >
            + Nueva Venta
          </button>
          <button 
            className="btn" 
            onClick={() => window.location.href = '/clientes'}
            style={{ width: 'auto', background: '#3498db' }}
          >
            + Nuevo Cliente
          </button>
          <button 
            className="btn" 
            onClick={() => window.location.href = '/productos'}
            style={{ width: 'auto', background: '#9b59b6' }}
          >
            + Nuevo Producto
          </button>
        </div>
      </div>
    </Layout>
  );
};