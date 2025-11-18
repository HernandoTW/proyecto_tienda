import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  valor: number;
  proveedor_id: number;
  proveedor_nombre: string;
  estado: boolean;
}

interface Proveedor {
  id: number;
  nombre: string;
}

export const Productos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    valor: 0,
    proveedor_id: 0
  });

  const loadProductos = async () => {
    try {
      const response = await api.get('/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadProveedores = async () => {
    try {
      const response = await api.get('/proveedores');
      setProveedores(response.data);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  useEffect(() => {
    loadProductos();
    loadProveedores();
  }, []);

  const handleNewProducto = () => {
    setEditingProducto(null);
    setFormData({
      nombre: '',
      descripcion: '',
      valor: 0,
      proveedor_id: proveedores[0]?.id || 0
    });
    setShowModal(true);
  };

  const handleEditProducto = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      valor: producto.valor,
      proveedor_id: producto.proveedor_id
    });
    setShowModal(true);
  };

  const handleSaveProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProducto) {
        await api.put(`/productos/${editingProducto.id}`, formData);
        alert('Producto actualizado correctamente');
      } else {
        await api.post('/productos', formData);
        alert('Producto creado correctamente');
      }
      setShowModal(false);
      loadProductos();
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error al guardar producto');
    }
  };

  const handleDeleteProducto = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await api.delete(`/productos/${id}`);
        alert('Producto eliminado correctamente');
        loadProductos();
      } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar producto');
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Productos">
        <div className="card">
          <p>Cargando productos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Productos">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Lista de Productos</h2>
          <button className="btn" onClick={handleNewProducto} style={{ width: 'auto' }}>
            + Nuevo Producto
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Descripción</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Valor</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Proveedor</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{producto.nombre}</td>
                  <td style={{ padding: '12px' }}>{producto.descripcion || '-'}</td>
                  <td style={{ padding: '12px' }}>${producto.valor.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>{producto.proveedor_nombre}</td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleEditProducto(producto)}
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
                      onClick={() => handleDeleteProducto(producto.id)}
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

      {/* Modal para crear/editar producto */}
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
              {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>

            <form onSubmit={handleSaveProducto}>
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
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontFamily: 'inherit' }}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Valor *</label>
                <input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Proveedor *</label>
                <select
                  value={formData.proveedor_id}
                  onChange={(e) => setFormData({...formData, proveedor_id: Number(e.target.value)})}
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

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn">
                  {editingProducto ? 'Actualizar' : 'Crear'} Producto
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