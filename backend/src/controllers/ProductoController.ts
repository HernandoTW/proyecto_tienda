import { Response } from 'express';
import { ProductoModel } from '../models/Producto';
import { AuthRequest } from '../middleware/auth';

export class ProductoController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const productos = await ProductoModel.findAll();
      res.json(productos);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const producto = await ProductoModel.findById(id);
      
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      res.json(producto);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  }

  static async getByProveedor(req: AuthRequest, res: Response) {
    try {
      const proveedorId = parseInt(req.params.proveedorId);
      const productos = await ProductoModel.findByProveedor(proveedorId);
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos del proveedor' });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const nuevoProducto = {
        ...req.body,
        estado: true
      };
      
      const id = await ProductoModel.create(nuevoProducto);
      res.status(201).json({ id, message: 'Producto creado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear producto' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const actualizado = await ProductoModel.update(id, req.body);
      
      if (!actualizado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const eliminado = await ProductoModel.delete(id);
      
      if (!eliminado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }
}