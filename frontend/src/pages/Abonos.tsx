import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

interface Abono {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  fecha: string;
  valor: number;
  descripcion?: string;
}

export const Abonos: React.FC = () => {
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    valor: '',
    descripcion: ''
  });
  const [clientes, setClientes] = useState<any[]>([]);

  // Cargar abonos - IDÉNTICO al loadClientes
  const loadAbonos = async () => {
    try {
      // Cargar clientes primero
      const clientesRes = await api.get('/clientes');
      setClientes(clientesRes.data);

      // Cargar abonos de cada cliente
      const todosAbonos: Abono[] = [];
      
      for (const cliente of clientesRes.data) {
        try {
          const abonosRes = await api.get(`/abonos/cliente/${cliente.id}`);
          if (abonosRes.data && Array.isArray(abonosRes.data)) {
            todosAbonos.push(...abonosRes.data);
          }
        } catch (error) {
          console.log(`Cliente ${cliente.id} no tiene abonos`);
        }
      }

      setAbonos(todosAbonos);
    } catch (error) {
      console.error('Error cargando abonos:', error);
      alert('Error al cargar abonos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbonos();
  }, []);

  // Abrir modal para nuevo abono - IDÉNTICO al handleNewCliente
  const handleNewAbono = () => {
    setFormData({
      cliente_id: '',
      valor: '',
      descripcion: ''
    });
    setShowModal(true);
  };

  // Guardar abono - IDÉNTICO al handleSaveCliente
  const handleSaveAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/abonos', {
        cliente_id: parseInt(formData.cliente_id),
        valor: parseFloat(formData.valor),
        descripcion: formData.descripcion
      });
      alert('Abono registrado correctamente');
      setShowModal(false);
      loadAbonos();
    } catch (error) {
      console.error('Error guardando abono:', error);
      alert('Error al guardar abono');
    }
  };

  if (loading) {
    return (
      <Layout title="Abonos">
        <div className="card">
          <p>Cargando abonos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Registro de Abonos">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Listado de Abonos</h2>
          <button className="btn" onClick={handleNewAbono} style={{ width: 'auto' }}>
            + Nuevo Abono
          </button>
        </div>

        {abonos.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fecha</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Cliente</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Valor</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {abonos.map((abono) => (
                  <tr key={abono.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>
                      {abono.fecha ? new Date(abono.fecha).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {abono.cliente_nombre || `Cliente ID: ${abono.cliente_id}`}
                    </td>
                    <td style={{ padding: '12px', color: '#27ae60', fontWeight: 'bold' }}>
                      +${abono.valor.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px' }}>{abono.descripcion || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>No hay abonos registrados</p>
            <button className="btn" onClick={handleNewAbono} style={{ marginTop: '10px' }}>
              Registrar Primer Abono
            </button>
          </div>
        )}
      </div>

      {/* Modal para nuevo abono - IDÉNTICO al modal de Clientes */}
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
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Registrar Abono</h3>

            <form onSubmit={handleSaveAbono}>
              <div className="form-group">
                <label>Cliente *</label>
                <select
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }}
                  required
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
                <label>Valor del Abono *</label>
                <input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  required
                  min="1"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Ej: Abono en efectivo, Pago semanal, etc."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn" style={{ background: '#27ae60' }}>
                  Registrar Abono
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