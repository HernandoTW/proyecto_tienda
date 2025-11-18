import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

interface Proveedor {
  id: number;
  nombre: string;
  telefono?: string;
  estado: boolean;
}

export const Proveedores: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: ''
  });

  const loadProveedores = async () => {
    try {
      const response = await api.get('/proveedores');
      setProveedores(response.data);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      alert('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProveedores();
  }, []);

  const handleNewProveedor = () => {
    setEditingProveedor(null);
    setFormData({
      nombre: '',
      telefono: ''
    });
    setShowModal(true);
  };

  const handleEditProveedor = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      telefono: proveedor.telefono || ''
    });
    setShowModal(true);
  };

  const handleSaveProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProveedor) {
        await api.put(`/proveedores/${editingProveedor.id}`, formData);
        alert('Proveedor actualizado correctamente');
      } else {
        await api.post('/proveedores', formData);
        alert('Proveedor creado correctamente');
      }
      setShowModal(false);
      loadProveedores();
    } catch (error) {
      console.error('Error guardando proveedor:', error);
      alert('Error al guardar proveedor');
    }
  };

  const handleDeleteProveedor = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      try {
        await api.delete(`/proveedores/${id}`);
        alert('Proveedor eliminado correctamente');
        loadProveedores();
      } catch (error) {
        console.error('Error eliminando proveedor:', error);
        alert('Error al eliminar proveedor');
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Proveedores">
        <div className="card">
          <p>Cargando proveedores...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Proveedores">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Lista de Proveedores</h2>
          <button className="btn" onClick={handleNewProveedor} style={{ width: 'auto' }}>
            + Nuevo Proveedor
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Teléfono</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((proveedor) => (
                <tr key={proveedor.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{proveedor.nombre}</td>
                  <td style={{ padding: '12px' }}>{proveedor.telefono || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleEditProveedor(proveedor)}
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
                      onClick={() => handleDeleteProveedor(proveedor.id)}
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

      {/* Modal para crear/editar proveedor */}
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
              {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h3>

            <form onSubmit={handleSaveProveedor}>
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
                <label>Teléfono</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn">
                  {editingProveedor ? 'Actualizar' : 'Crear'} Proveedor
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