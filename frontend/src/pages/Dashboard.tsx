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
  const [showTelefonoModal, setShowTelefonoModal] = useState(false);
  const [telefonoInput, setTelefonoInput] = useState('');
  const [pendienteSeleccionado, setPendienteSeleccionado] = useState<any>(null);

  const loadDashboardData = async () => {
    try {
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

  // Función para manejar el clic en "Cobrar"
  const handleCobrarClick = (pendiente: any) => {
    setPendienteSeleccionado(pendiente);
    
    if (pendiente.cliente_telefono) {
      // Si ya tiene teléfono, enviar WhatsApp directamente
      enviarWhatsapp(pendiente.cliente_telefono, pendiente.valor_total, pendiente.descripcion, pendiente.cliente_nombre || 'cliente');
    } else {
      // Si no tiene teléfono, mostrar modal para ingresarlo
      setTelefonoInput('');
      setShowTelefonoModal(true);
    }
  };

  // Función para enviar mensaje de WhatsApp
  const enviarWhatsapp = (telefono: string, valor: number, descripcion: string, clienteNombre: string) => {
    const telefonoLimpio = telefono.replace(/\D/g, '');
    
    if (!telefonoLimpio) {
      alert('Por favor ingrese un número de teléfono válido');
      return;
    }

    const mensaje = `Cordial saludo, estimado ${clienteNombre}. Nos permitimos recordarle que tiene un saldo pendiente por pagar de $${valor.toLocaleString()}, por concepto de: ${descripcion}.`;
    
    const url = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // Función para confirmar el envío desde el modal
  const handleConfirmarWhatsapp = () => {
    if (!telefonoInput.trim()) {
      alert('Por favor ingrese un número de teléfono');
      return;
    }

    if (pendienteSeleccionado) {
      enviarWhatsapp(
        telefonoInput,
        pendienteSeleccionado.valor_total,
        pendienteSeleccionado.descripcion,
        pendienteSeleccionado.cliente_nombre || 'cliente'
      );
      setShowTelefonoModal(false);
      setPendienteSeleccionado(null);
      setTelefonoInput('');
    }
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
                        {pendiente.cliente_telefono && (
                          <small style={{ color: '#27ae60', marginLeft: '8px', fontSize: '12px' }}>
                            📞 {pendiente.cliente_telefono}
                          </small>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#555' }}>
                        ${pendiente.valor_total.toLocaleString()} - {pendiente.descripcion}
                      </div>
                      <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
                        {new Date(pendiente.fecha).toLocaleDateString()}
                      </small>
                    </div>
                    
                    <button 
                      onClick={() => handleCobrarClick(pendiente)}
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

      {/* Modal para ingresar teléfono */}
      {showTelefonoModal && pendienteSeleccionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '15px' }}>Ingresar Teléfono</h3>
            
            <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
              Para enviar recordatorio a: <strong>{pendienteSeleccionado.cliente_nombre || 'Cliente no registrado'}</strong>
            </p>
            
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              Valor pendiente: <strong style={{ color: '#e74c3c' }}>${pendienteSeleccionado.valor_total.toLocaleString()}</strong>
            </p>

            <div className="form-group">
              <label>Número de WhatsApp *</label>
              <input
                type="tel"
                value={telefonoInput}
                onChange={(e) => setTelefonoInput(e.target.value)}
                placeholder="Ej: 3001234567"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }}
                required
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                Ingrese el número con código de país (Ej: 573001234567)
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={handleConfirmarWhatsapp}
                className="btn" 
                style={{ background: '#25D366', flex: 1 }}
              >
                📱 Enviar WhatsApp
              </button>
              <button 
                onClick={() => {
                  setShowTelefonoModal(false);
                  setPendienteSeleccionado(null);
                  setTelefonoInput('');
                }}
                className="btn" 
                style={{ background: '#95a5a6', width: 'auto' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};