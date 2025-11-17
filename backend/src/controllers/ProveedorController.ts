import { Response } from 'express';
import { ProveedorModel } from '../models/Proveedor';
import { AuthRequest } from '../middleware/auth';

export class ProveedorController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const proveedores = await ProveedorModel.findAll();
      res.json(proveedores);
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      res.status(500).json({ error: 'Error al obtener proveedores' });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const proveedor = await ProveedorModel.findById(id);
      
      if (!proveedor) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      
      res.json(proveedor);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener proveedor' });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const nuevoProveedor = {
        ...req.body,
        estado: true
      };
      
      const id = await ProveedorModel.create(nuevoProveedor);
      res.status(201).json({ id, message: 'Proveedor creado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear proveedor' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const actualizado = await ProveedorModel.update(id, req.body);
      
      if (!actualizado) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      
      res.json({ message: 'Proveedor actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const eliminado = await ProveedorModel.delete(id);
      
      if (!eliminado) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      
      res.json({ message: 'Proveedor eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
  }
}