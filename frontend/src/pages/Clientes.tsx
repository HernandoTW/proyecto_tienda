import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

interface Cliente {
  id: number;
  nombre: string;
  alias?: string;
  telefono?: string;
  direccion?: string;
  limite_credito: number;
  cliente_regular: boolean;
  estado: boolean;
}

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    alias: '',
    telefono: '',
    direccion: '',
    limite_credito: 0,
    cliente_regular: false
  });

  // Cargar clientes
  const loadClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      alert('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  // Abrir modal para nuevo cliente
  const handleNewCliente = () => {
    setEditingCliente(null);
    setFormData({
      nombre: '',
      alias: '',
      telefono: '',
      direccion: '',
      limite_credito: 0,
      cliente_regular: false
    });
    setShowModal(true);
  };

  // Abrir modal para editar cliente
  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      alias: cliente.alias || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      limite_credito: cliente.limite_credito,
      cliente_regular: cliente.cliente_regular
    });
    setShowModal(true);
  };

  // Guardar cliente (crear o actualizar)
  const handleSaveCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await api.put(`/clientes/${editingCliente.id}`, formData);
        alert('Cliente actualizado correctamente');
      } else {
        await api.post('/clientes', formData);
        alert('Cliente creado correctamente');
      }
      setShowModal(false);
      loadClientes();
    } catch (error) {
      console.error('Error guardando cliente:', error);
      alert('Error al guardar cliente');
    }
  };

  // Eliminar cliente
  const handleDeleteCliente = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await api.delete(`/clientes/${id}`);
        alert('Cliente eliminado correctamente');
        loadClientes();
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        alert('Error al eliminar cliente');
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Clientes">
        <div className="card">
          <p>Cargando clientes...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Clientes">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Lista de Clientes</h2>
          <button className="btn" onClick={handleNewCliente} style={{ width: 'auto' }}>
            + Nuevo Cliente
          </button>
        </div>

        {/* Tabla de Clientes */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Alias</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Teléfono</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Límite Crédito</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Regular</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{cliente.nombre}</td>
                  <td style={{ padding: '12px' }}>{cliente.alias || '-'}</td>
                  <td style={{ padding: '12px' }}>{cliente.telefono || '-'}</td>
                  <td style={{ padding: '12px' }}>${cliente.limite_credito.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>{cliente.cliente_regular ? 'Sí' : 'No'}</td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleEditCliente(cliente)}
                      style={{ 
                        background: '#3498db', 
                        color: 'white', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: '4px', 
                        marginRight: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteCliente(cliente.id)}
                      style={{ 
                        background: '#e74c3c', 
                        color: 'white', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: '4px',
                        cursor: 'pointer'
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

      {/* Modal para crear/editar cliente */}
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
              {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>

            <form onSubmit={handleSaveCliente}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Alias</label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({...formData, alias: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Límite de Crédito</label>
                <input
                  type="number"
                  value={formData.limite_credito}
                  onChange={(e) => setFormData({...formData, limite_credito: Number(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={formData.cliente_regular}
                    onChange={(e) => setFormData({...formData, cliente_regular: e.target.checked})}
                    style={{ marginRight: '8px' }}
                  />
                  Cliente Regular
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn">
                  {editingCliente ? 'Actualizar' : 'Crear'} Cliente
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