import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

interface Negocio {
  id: number;
  nombre: string;
  telefono?: string;
  persona_contacto?: string;
  email?: string;
  direccion?: string;
}

export const Parametrizacion: React.FC = () => {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    persona_contacto: '',
    email: '',
    direccion: ''
  });

  const loadNegocio = async () => {
    try {
      const response = await api.get('/negocio');
      const datosNegocio = response.data;
      
      // VERIFICACIÓN MÁS ROBUSTA como en Clientes
      if (datosNegocio) {
        setNegocio(datosNegocio);
        setFormData({
          nombre: datosNegocio.nombre || '',
          telefono: datosNegocio.telefono || '',
          persona_contacto: datosNegocio.persona_contacto || '',
          email: datosNegocio.email || '',
          direccion: datosNegocio.direccion || ''
        });
      }
    } catch (error) {
      console.error('Error cargando datos del negocio:', error);
      alert('Error al cargar datos del negocio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNegocio();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!negocio) {
      alert('No se pueden guardar los datos. El negocio no está cargado.');
      return;
    }

    setSaving(true);

    try {
      await api.put(`/negocio/${negocio.id}`, formData);
      alert('Datos del negocio actualizados correctamente');
      loadNegocio(); // Recargar datos
    } catch (error) {
      console.error('Error guardando datos:', error);
      alert('Error al guardar datos del negocio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Parametrización">
        <div className="card">
          <p>Cargando datos del negocio...</p>
        </div>
      </Layout>
    );
  }

  // AGREGAR ESTA VERIFICACIÓN EXTRA
  if (!negocio) {
    return (
      <Layout title="Parametrización">
        <div className="card">
          <p>No se pudieron cargar los datos del negocio.</p>
          <button onClick={loadNegocio} className="btn" style={{ marginTop: '10px' }}>
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Parametrización del Negocio">
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Información del Negocio</h2>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Nombre del Negocio *</label>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Persona de Contacto</label>
              <input
                type="text"
                value={formData.persona_contacto}
                onChange={(e) => setFormData({...formData, persona_contacto: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label>Dirección</label>
            <textarea
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontFamily: 'inherit' }}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              className="btn" 
              disabled={saving}
              style={{ width: 'auto' }}
            >
              {saving ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};