import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

interface PagoProveedor {
  id: number;
  proveedor_id: number;
  proveedor_nombre: string;
  fecha: string;
  valor: number;
  descripcion?: string;
  metodo_pago: string;
}

export const PagosProveedores: React.FC = () => {
  const [pagos, setPagos] = useState<PagoProveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    proveedor_id: '',
    valor: '',
    descripcion: '',
    metodo_pago: 'efectivo'
  });
  const [proveedores, setProveedores] = useState<any[]>([]);

  // Cargar pagos
  const loadPagos = async () => {
    try {
      // Cargar proveedores primero
      const proveedoresRes = await api.get('/proveedores');
      setProveedores(proveedoresRes.data);

      // Cargar pagos de cada proveedor
      const todosPagos: PagoProveedor[] = [];
      
      for (const proveedor of proveedoresRes.data) {
        try {
          const pagosRes = await api.get(`/pagos-proveedores/proveedor/${proveedor.id}`);
          if (pagosRes.data && Array.isArray(pagosRes.data)) {
            todosPagos.push(...pagosRes.data);
          }
        } catch (error) {
          console.log(`Proveedor ${proveedor.id} no tiene pagos`);
        }
      }

      setPagos(todosPagos);
    } catch (error) {
      console.error('Error cargando pagos a proveedores:', error);
      alert('Error al cargar pagos a proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPagos();
  }, []);

  // Abrir modal para nuevo pago
  const handleNewPago = () => {
    setFormData({
      proveedor_id: '',
      valor: '',
      descripcion: '',
      metodo_pago: 'efectivo'
    });
    setShowModal(true);
  };

  // Guardar pago
  const handleSavePago = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/pagos-proveedores', {
        proveedor_id: parseInt(formData.proveedor_id),
        valor: parseFloat(formData.valor),
        descripcion: formData.descripcion,
        metodo_pago: formData.metodo_pago
      });
      alert('Pago registrado correctamente');
      setShowModal(false);
      loadPagos();
    } catch (error) {
      console.error('Error guardando pago:', error);
      alert('Error al guardar pago');
    }
  };

  if (loading) {
    return (
      <Layout title="Pagos a Proveedores">
        <div className="card">
          <p>Cargando pagos a proveedores...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Pagos a Proveedores">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Registro de Pagos a Proveedores</h2>
          <button className="btn" onClick={handleNewPago} style={{ width: 'auto' }}>
            + Nuevo Pago
          </button>
        </div>

        {pagos.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fecha</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Proveedor</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Valor</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Método de Pago</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>
                      {pago.fecha ? new Date(pago.fecha).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {pago.proveedor_nombre || `Proveedor ID: ${pago.proveedor_id}`}
                    </td>
                    <td style={{ padding: '12px', color: '#e74c3c', fontWeight: 'bold' }}>
                      -${pago.valor.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: '#f39c12',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}>
                        {pago.metodo_pago}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{pago.descripcion || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>No hay pagos a proveedores registrados</p>
            <button className="btn" onClick={handleNewPago} style={{ marginTop: '10px' }}>
              Registrar Primer Pago
            </button>
          </div>
        )}
      </div>

      {/* Modal para nuevo pago */}
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
            <h3 style={{ marginBottom: '20px' }}>Registrar Pago a Proveedor</h3>

            <form onSubmit={handleSavePago}>
              <div className="form-group">
                <label>Proveedor *</label>
                <select
                  value={formData.proveedor_id}
                  onChange={(e) => setFormData({...formData, proveedor_id: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }}
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Valor del Pago *</label>
                <input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  required
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Método de Pago *</label>
                <select
                  value={formData.metodo_pago}
                  onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }}
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">DaviPlata</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Ej: Pago por mercancía recibida, Abono de factura, etc."
                  rows={3}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn" style={{ background: '#e67e22' }}>
                  Registrar Pago
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setShowModal(false)}
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