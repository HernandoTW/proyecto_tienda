import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

interface DashboardData {
  ventasHoy: { total: number; count: number };
  ventasPendientes: number;
  ventasRecientes: any[];
  pendientes: any[];
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    ventasHoy: { total: 0, count: 0 },
    ventasPendientes: 0,
    ventasRecientes: [],
    pendientes: []
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      // Cargar datos en paralelo
      const [
        ventasHoyRes,
        pendientesRes,
        ventasRecientesRes
      ] = await Promise.all([
        api.get('/ventas/hoy/estadisticas'),
        api.get('/ventas/pendientes'),
        api.get('/ventas')
      ]);

      setData({
        ventasHoy: ventasHoyRes.data,
        ventasPendientes: pendientesRes.data.length,
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

  // Función para enviar mensaje de WhatsApp
  const enviarWhatsapp = (clienteTelefono: string, valor: number, descripcion: string, clienteNombre: string) => {
    const telefono = clienteTelefono ? clienteTelefono.replace(/\D/g, '') : '';
    
    if (!telefono) {
      alert('El cliente no tiene número de teléfono registrado');
      return;
    }

    const mensaje = `Cordial saludo, estimado ${clienteNombre}. Nos permitimos recordarle que tiene un saldo pendiente por pagar de $${valor.toLocaleString()}, por concepto de: ${descripcion}.`;
    
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

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
      {/* Estadísticas Simplificadas */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Ventas Hoy</h3>
          <div className="number">${data.ventasHoy.total.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>Pendientes</h3>
          <div className="number" style={{ color: '#e74c3c' }}>{data.ventasPendientes}</div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ color: '#e74c3c', margin: 0 }}>⚠️ Pendientes por Cobrar</h2>
            <span style={{ 
              background: '#e74c3c', 
              color: 'white', 
              padding: '4px 8px', 
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {data.ventasPendientes}
            </span>
          </div>
          
          {data.pendientes.length > 0 ? (
            <div>
              {data.pendientes.map((pendiente) => (
                <div key={pendiente.id} style={{
                  padding: '12px',
                  border: '1px solid #f39c12',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  background: '#fef9e7'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {pendiente.cliente_nombre || 'Cliente no registrado'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#555' }}>
                        ${pendiente.valor_total.toLocaleString()} - {pendiente.descripcion}
                      </div>
                      <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
                        {new Date(pendiente.fecha).toLocaleDateString()}
                      </small>
                    </div>
                    
                    <button 
                      onClick={() => enviarWhatsapp(
                        pendiente.cliente_telefono, 
                        pendiente.valor_total, 
                        pendiente.descripcion,
                        pendiente.cliente_nombre || 'cliente'
                      )}
                      style={{ 
                        background: '#25D366', 
                        color: 'white', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginLeft: '10px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      💬 Cobrar
                    </button>
                  </div>
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