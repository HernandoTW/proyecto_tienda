import { Response } from 'express';
import { NegocioModel } from '../models/Negocio';
import { AuthRequest } from '../middleware/auth';

export class NegocioController {
  static async get(req: AuthRequest, res: Response) {
    try {
      let negocio = await NegocioModel.findOne();
      
      // Si no existe, crear uno por defecto
      if (!negocio) {
        const nuevoId = await NegocioModel.create({
          nombre: 'Mi Tienda',
          telefono: '',
          persona_contacto: '',
          email: '',
          direccion: ''
        });
        // Volver a cargar el negocio recién creado
        negocio = await NegocioModel.findOne();
      }
      
      res.json(negocio);
    } catch (error) {
      console.error('Error al obtener datos del negocio:', error);
      res.status(500).json({ error: 'Error al obtener datos del negocio' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      // Verificar que el negocio existe
      const negocioExistente = await NegocioModel.findOne();
      if (!negocioExistente) {
        return res.status(404).json({ error: 'Registro de negocio no encontrado' });
      }

      const actualizado = await NegocioModel.update(id, req.body);
      
      if (!actualizado) {
        return res.status(404).json({ error: 'No se pudo actualizar el negocio' });
      }
      
      res.json({ message: 'Datos del negocio actualizados correctamente' });
    } catch (error) {
      console.error('Error actualizando negocio:', error);
      res.status(500).json({ error: 'Error al actualizar datos del negocio' });
    }
  }
}