import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

interface Venta {
  id: number;
  cliente_id?: number;
  cliente_nombre?: string;
  cliente_alias?: string;
  cliente_telefono?: string;
  fecha: string;
  valor_total: number;
  tipo_venta: 'contado' | 'credito' | 'pendiente';
  medio_pago: 'efectivo' | 'transferencia' | 'n/a';
  estado: 'completada' | 'pendiente';
  descripcion: string;
}

interface Cliente {
  id: number;
  nombre: string;
  alias?: string;
}

export const Ventas: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null);
  
  // Estado para nueva venta
  const [formData, setFormData] = useState({
    cliente_id: '',
    valor_total: 0,
    tipo_venta: 'contado' as 'contado' | 'credito' | 'pendiente',
    medio_pago: 'efectivo' as 'efectivo' | 'transferencia' | 'n/a',
    descripcion: ''
  });

  // Estado para editar venta
  const [editFormData, setEditFormData] = useState({
    cliente_id: '',
    valor_total: 0,
    tipo_venta: 'contado' as 'contado' | 'credito' | 'pendiente',
    medio_pago: 'efectivo' as 'efectivo' | 'transferencia' | 'n/a',
    estado: 'completada' as 'completada' | 'pendiente',
    descripcion: ''
  });

  const loadVentas = async () => {
    try {
      const response = await api.get('/ventas');
      setVentas(response.data);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      alert('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  useEffect(() => {
    loadVentas();
    loadClientes();
  }, []);

  // NUEVA VENTA
  const handleNewVenta = () => {
    setEditingVenta(null);
    setFormData({
      cliente_id: '',
      valor_total: 0,
      tipo_venta: 'contado',
      medio_pago: 'efectivo',
      descripcion: ''
    });
    setShowModal(true);
  };

  const handleSaveVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ventaData = {
        ...formData,
        cliente_id: formData.cliente_id ? parseInt(formData.cliente_id) : null,
        estado: formData.tipo_venta === 'pendiente' ? 'pendiente' : 'completada',
        medio_pago: formData.tipo_venta === 'credito' || formData.tipo_venta === 'pendiente' ? 'n/a' : formData.medio_pago
      };

      await api.post('/ventas', ventaData);
      alert('Venta registrada correctamente');
      setShowModal(false);
      loadVentas();
    } catch (error) {
      console.error('Error guardando venta:', error);
      alert('Error al guardar venta');
    }
  };

  // EDITAR VENTA
  const handleEditVenta = (venta: Venta) => {
    setEditingVenta(venta);
    setEditFormData({
      cliente_id: venta.cliente_id?.toString() || '',
      valor_total: venta.valor_total,
      tipo_venta: venta.tipo_venta,
      medio_pago: venta.medio_pago,
      estado: venta.estado,
      descripcion: venta.descripcion
    });
    setShowModal(true);
  };

  const handleUpdateVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenta) return;
    
    try {
      const ventaData = {
        ...editFormData,
        cliente_id: editFormData.cliente_id ? parseInt(editFormData.cliente_id) : null,
        medio_pago: editFormData.tipo_venta === 'credito' || editFormData.tipo_venta === 'pendiente' ? 'n/a' : editFormData.medio_pago
      };

      await api.put(`/ventas/${editingVenta.id}`, ventaData);
      alert('Venta actualizada correctamente');
      setShowModal(false);
      setEditingVenta(null);
      loadVentas();
    } catch (error) {
      console.error('Error actualizando venta:', error);
      alert('Error al actualizar venta');
    }
  };

  // ELIMINAR VENTA
  const handleDeleteVenta = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta venta?')) {
      try {
        await api.delete(`/ventas/${id}`);
        alert('Venta eliminada correctamente');
        loadVentas();
      } catch (error) {
        console.error('Error eliminando venta:', error);
        alert('Error al eliminar venta');
      }
    }
  };

  const handleTipoVentaChange = (tipo: 'contado' | 'credito' | 'pendiente') => {
    setFormData({
      ...formData,
      tipo_venta: tipo,
      medio_pago: tipo === 'contado' ? 'efectivo' : 'n/a'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada': return '#27ae60';
      case 'pendiente': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getTipoVentaText = (tipo: string) => {
    switch (tipo) {
      case 'contado': return 'Contado';
      case 'credito': return 'Crédito';
      case 'pendiente': return 'Pendiente';
      default: return tipo;
    }
  };

  if (loading) {
    return (
      <Layout title="Ventas">
        <div className="card">
          <p>Cargando ventas...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Ventas">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Registro de Ventas</h2>
          <button className="btn" onClick={handleNewVenta} style={{ width: 'auto' }}>
            + Nueva Venta
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fecha</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Cliente</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Descripción</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Valor</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tipo</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Estado</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>
                    {new Date(venta.fecha).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {venta.cliente_nombre || 'Sin cliente'}
                    {venta.cliente_alias && <div style={{ color: '#666', fontSize: '12px' }}>({venta.cliente_alias})</div>}
                  </td>
                  <td style={{ padding: '12px' }}>{venta.descripcion}</td>
                  <td style={{ padding: '12px' }}>${venta.valor_total.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>{getTipoVentaText(venta.tipo_venta)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: getEstadoColor(venta.estado),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {venta.estado}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleEditVenta(venta)}
                      style={{ 
                        background: '#3498db', 
                        color: 'white', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: '4px', 
                        marginRight: '8px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteVenta(venta.id)}
                      style={{ 
                        background: '#e74c3c', 
                        color: 'white', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para nueva/editar venta */}
      {showModal && (
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
            maxWidth: '500px'
          }}>
            <h3 style={{ marginBottom: '20px' }}>
              {editingVenta ? 'Editar Venta' : 'Nueva Venta'}
            </h3>

            <form onSubmit={editingVenta ? handleUpdateVenta : handleSaveVenta}>
              <div className="form-group">
                <label>Cliente (opcional)</label>
                <select
                  value={editingVenta ? editFormData.cliente_id : formData.cliente_id}
                  onChange={(e) => editingVenta 
                    ? setEditFormData({...editFormData, cliente_id: e.target.value})
                    : setFormData({...formData, cliente_id: e.target.value})
                  }
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }}
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.alias ? `(${cliente.alias})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  value={editingVenta ? editFormData.descripcion : formData.descripcion}
                  onChange={(e) => editingVenta
                    ? setEditFormData({...editFormData, descripcion: e.target.value})
                    : setFormData({...formData, descripcion: e.target.value})
                  }
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontFamily: 'inherit' }}
                  rows={3}
                  placeholder="Ej: 1 lb carne, 1 lt leche, 10 huevos"
                  required
                />
              </div>

              <div className="form-group">
                <label>Valor Total *</label>
                <input
                  type="number"
                  value={editingVenta ? editFormData.valor_total : formData.valor_total}
                  onChange={(e) => editingVenta
                    ? setEditFormData({...editFormData, valor_total: Number(e.target.value)})
                    : setFormData({...formData, valor_total: Number(e.target.value)})
                  }
                  required
                />
              </div>

              {/* Campo de estado solo en modo edición */}
              {editingVenta && (
                <div className="form-group">
                  <label>Estado *</label>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setEditFormData({...editFormData, estado: 'completada'})}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: `2px solid ${editFormData.estado === 'completada' ? '#27ae60' : '#ddd'}`,
                        background: editFormData.estado === 'completada' ? '#27ae60' : 'white',
                        color: editFormData.estado === 'completada' ? 'white' : '#333',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Completada
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditFormData({...editFormData, estado: 'pendiente'})}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: `2px solid ${editFormData.estado === 'pendiente' ? '#f39c12' : '#ddd'}`,
                        background: editFormData.estado === 'pendiente' ? '#f39c12' : 'white',
                        color: editFormData.estado === 'pendiente' ? 'white' : '#333',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Pendiente
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Tipo de Venta *</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => editingVenta 
                      ? setEditFormData({...editFormData, tipo_venta: 'contado', medio_pago: 'efectivo'})
                      : handleTipoVentaChange('contado')
                    }
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: `2px solid ${(editingVenta ? editFormData.tipo_venta : formData.tipo_venta) === 'contado' ? '#3498db' : '#ddd'}`,
                      background: (editingVenta ? editFormData.tipo_venta : formData.tipo_venta) === 'contado' ? '#3498db' : 'white',
                      color: (editingVenta ? editFormData.tipo_venta : formData.tipo_venta) === 'contado' ? 'white' : '#333',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Contado
                  </button>
                  <button
                    type="button"
                    onClick={() => editingVenta 
                      ? setEditFormData({...editFormData, tipo_venta: 'credito', medio_pago: 'n/a'})
                      : handleTipoVentaChange('credito')
                    }
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: `2px solid ${(editingVenta ? editFormData.tipo_venta : formData.tipo_venta) === 'credito' ? '#3498db' : '#ddd'}`,
                      background: (editingVenta ? editFormData.tipo_venta : formData.tipo_venta) === 'credito' ? '#3498db' : 'white',
                      color: (editingVenta ? editFormData.tipo_venta : formData.tipo_venta) === 'credito' ? 'white' : '#333',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Crédito
                  </button>
                  <button
                    type="button"
                    onClick={() => editingVenta 
                      ? setEditFormData({...editFormData, tipo_venta: 'pendiente', medio_pago: 'n/a'})
                      : handleTipoVentaChange('pendiente')
                    }
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: `2px solid ${(editingVenta ? editFormData.tipo_venta : formData.tipo_venta) === 'pendiente' ? '#3498db' : '#ddd'}`,
                      background: (editingVenta ? editFormData.tipo_venta : formData.tipo_venta) === 'pendiente' ? '#3498db' : 'white',
                      color: (editingVenta ? editFormData.tipo_venta : formData.tipo_venta) === 'pendiente' ? 'white' : '#333',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Pendiente
                  </button>
                </div>
              </div>

              {(editingVenta ? editFormData.tipo_venta : formData.tipo_venta) === 'contado' && (
                <div className="form-group">
                  <label>Medio de Pago *</label>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => editingVenta
                        ? setEditFormData({...editFormData, medio_pago: 'efectivo'})
                        : setFormData({...formData, medio_pago: 'efectivo'})
                      }
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: `2px solid ${(editingVenta ? editFormData.medio_pago : formData.medio_pago) === 'efectivo' ? '#27ae60' : '#ddd'}`,
                        background: (editingVenta ? editFormData.medio_pago : formData.medio_pago) === 'efectivo' ? '#27ae60' : 'white',
                        color: (editingVenta ? editFormData.medio_pago : formData.medio_pago) === 'efectivo' ? 'white' : '#333',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Efectivo
                    </button>
                    <button
                      type="button"
                      onClick={() => editingVenta
                        ? setEditFormData({...editFormData, medio_pago: 'transferencia'})
                        : setFormData({...formData, medio_pago: 'transferencia'})
                      }
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: `2px solid ${(editingVenta ? editFormData.medio_pago : formData.medio_pago) === 'transferencia' ? '#27ae60' : '#ddd'}`,
                        background: (editingVenta ? editFormData.medio_pago : formData.medio_pago) === 'transferencia' ? '#27ae60' : 'white',
                        color: (editingVenta ? editFormData.medio_pago : formData.medio_pago) === 'transferencia' ? 'white' : '#333',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Transferencia
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn">
                  {editingVenta ? 'Actualizar' : 'Registrar'} Venta
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingVenta(null);
                  }}
                  style={{ background: '#95a5a6' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};