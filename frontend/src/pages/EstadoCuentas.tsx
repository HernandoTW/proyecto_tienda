import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

interface ClienteConSaldo {
  id: number;
  nombre: string;
  alias?: string;
  limite_credito: number;
  saldo_actual: number;
  ventas_credito: any[];
  abonos: any[];
}

export const EstadoCuentas: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteConSaldo[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteDetalle, setClienteDetalle] = useState<ClienteConSaldo | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);

  // Función para sumar correctamente los valores
  const sumarValores = (items: any[], campo: string): number => {
    return items.reduce((total, item) => {
      const valor = parseFloat(item[campo]) || 0;
      return total + valor;
    }, 0);
  };

  const loadEstadoCuentas = async () => {
    try {
      const clientesRes = await api.get('/clientes');
      const clientesData = clientesRes.data;

      // Cargar información detallada de cada cliente
      const clientesConInfo = await Promise.all(
        clientesData.map(async (cliente: any) => {
          try {
            const [ventasRes, abonosRes] = await Promise.all([
              api.get(`/ventas/cliente/${cliente.id}`),
              api.get(`/abonos/cliente/${cliente.id}`)
            ]);

            // Calcular saldo basado en ventas a crédito y abonos
            const ventasCredito = ventasRes.data.filter((v: any) => v.tipo_venta === 'credito');
            const abonos = abonosRes.data;

            // Calcular totales CORRECTAMENTE
            const totalVentas = sumarValores(ventasCredito, 'valor_total');
            const totalAbonos = sumarValores(abonos, 'valor');
            
            // El saldo actual es: ventas a crédito - abonos
            // Si es negativo, es saldo a favor (el cliente pagó de más)
            const saldo_actual = totalVentas - totalAbonos;

            return {
              ...cliente,
              saldo_actual: saldo_actual, // Mantener negativo si hay saldo a favor
              ventas_credito: ventasCredito,
              abonos: abonos
            };
          } catch (error) {
            console.error(`Error cargando datos del cliente ${cliente.nombre}:`, error);
            return {
              ...cliente,
              saldo_actual: 0,
              ventas_credito: [],
              abonos: []
            };
          }
        })
      );

      // Filtrar clientes que tienen saldo pendiente O tienen ventas a crédito O saldo a favor
      setClientes(clientesConInfo.filter((cliente: ClienteConSaldo) => 
        cliente.saldo_actual !== 0 || cliente.ventas_credito.length > 0
      ));

    } catch (error) {
      console.error('Error cargando estado de cuentas:', error);
      alert('Error al cargar estado de cuentas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstadoCuentas();
  }, []);

  const verDetalleCliente = (cliente: ClienteConSaldo) => {
    setClienteDetalle(cliente);
    setShowDetalle(true);
  };

  // Calcular totales para el detalle
  const calcularTotales = (cliente: ClienteConSaldo) => {
    const totalVentas = sumarValores(cliente.ventas_credito, 'valor_total');
    const totalAbonos = sumarValores(cliente.abonos, 'valor');
    const saldoPendiente = totalVentas - totalAbonos;
    const disponible = cliente.limite_credito - Math.max(0, saldoPendiente);
    
    return { totalVentas, totalAbonos, saldoPendiente, disponible };
  };

  // Determinar color y texto según el saldo
  const getSaldoInfo = (saldo: number) => {
    if (saldo > 0) {
      return { color: '#e74c3c', texto: `$${Math.abs(saldo).toLocaleString()}`, label: 'Debe' };
    } else if (saldo < 0) {
      return { color: '#27ae60', texto: `$${Math.abs(saldo).toLocaleString()}`, label: 'Saldo a favor' };
    } else {
      return { color: '#95a5a6', texto: '$0', label: 'Al día' };
    }
  };

  if (loading) {
    return (
      <Layout title="Estado de Cuentas">
        <div className="card">
          <p>Cargando estado de cuentas...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Estado de Cuentas">
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Estado de Cuentas por Cliente</h2>

        {clientes.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Cliente</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Límite Crédito</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Estado Cuenta</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Disponible</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => {
                  const saldoInfo = getSaldoInfo(cliente.saldo_actual);
                  const disponible = cliente.limite_credito - Math.max(0, cliente.saldo_actual);
                  
                  return (
                    <tr key={cliente.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{cliente.nombre}</strong>
                        {cliente.alias && <div style={{ color: '#666', fontSize: '14px' }}>Alias: {cliente.alias}</div>}
                      </td>
                      <td style={{ padding: '12px' }}>${cliente.limite_credito.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ 
                          color: saldoInfo.color, 
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          {saldoInfo.texto}
                        </div>
                        <div style={{ 
                          color: '#666', 
                          fontSize: '12px',
                          fontStyle: 'italic'
                        }}>
                          {saldoInfo.label}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '12px',
                        color: '#27ae60',
                        fontWeight: 'bold'
                      }}>
                        ${disponible.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button 
                          onClick={() => verDetalleCliente(cliente)}
                          style={{ 
                            background: '#3498db', 
                            color: 'white', 
                            border: 'none', 
                            padding: '6px 12px', 
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>No hay clientes con cuentas activas</p>
          </div>
        )}
      </div>

      {/* Modal de detalle del cliente */}
      {showDetalle && clienteDetalle && (
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
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px' }}>
              Detalle de Cuenta: {clienteDetalle.nombre}
            </h3>

            {/* Resumen */}
            {(() => {
              const { totalVentas, totalAbonos, saldoPendiente, disponible } = calcularTotales(clienteDetalle);
              const saldoInfo = getSaldoInfo(saldoPendiente);
              
              return (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: '15px',
                  marginBottom: '20px',
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div>
                    <strong>Límite de Crédito:</strong><br />
                    ${clienteDetalle.limite_credito.toLocaleString()}
                  </div>
                  <div>
                    <strong>Total Ventas Crédito:</strong><br />
                    ${totalVentas.toLocaleString()}
                  </div>
                  <div>
                    <strong>Total Abonado:</strong><br />
                    ${totalAbonos.toLocaleString()}
                  </div>
                  <div>
                    <strong>Estado Cuenta:</strong><br />
                    <span style={{ 
                      color: saldoInfo.color,
                      fontWeight: 'bold'
                    }}>
                      {saldoInfo.texto}
                    </span>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {saldoInfo.label}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 4', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                    <strong>Disponible:</strong>{' '}
                    <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                      ${disponible.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Ventas a crédito */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Ventas a Crédito</h4>
              {clienteDetalle.ventas_credito.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e8f4fd' }}>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fecha</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Descripción</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clienteDetalle.ventas_credito.map((venta: any) => (
                        <tr key={venta.id}>
                          <td style={{ padding: '8px' }}>
                            {venta.fecha ? new Date(venta.fecha).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ padding: '8px' }}>{venta.descripcion || 'Venta a crédito'}</td>
                          <td style={{ padding: '8px', color: '#e74c3c', fontWeight: 'bold' }}>
                            ${(parseFloat(venta.valor_total) || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold' }} colSpan={2}>TOTAL VENTAS:</td>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#e74c3c' }}>
                          ${sumarValores(clienteDetalle.ventas_credito, 'valor_total').toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No hay ventas a crédito</p>
              )}
            </div>

            {/* Abonos */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Abonos Realizados</h4>
              {clienteDetalle.abonos.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e8f6ef' }}>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fecha</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Descripción</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clienteDetalle.abonos.map((abono: any) => (
                        <tr key={abono.id}>
                          <td style={{ padding: '8px' }}>
                            {abono.fecha ? new Date(abono.fecha).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ padding: '8px' }}>{abono.descripcion || 'Abono a cuenta'}</td>
                          <td style={{ padding: '8px', color: '#27ae60', fontWeight: 'bold' }}>
                            +${(parseFloat(abono.valor) || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold' }} colSpan={2}>TOTAL ABONADO:</td>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#27ae60' }}>
                          +${sumarValores(clienteDetalle.abonos, 'valor').toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No hay abonos registrados</p>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                className="btn" 
                onClick={() => setShowDetalle(false)}
                style={{ background: '#95a5a6' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};