import { Response } from 'express';
import { VentaModel } from '../models/Venta';
import { AuthRequest } from '../middleware/auth';

export class VentaController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const ventas = await VentaModel.findAll();
      res.json(ventas);
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      res.status(500).json({ error: 'Error al obtener ventas' });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const venta = await VentaModel.findById(id);
      
      if (!venta) {
        return res.status(404).json({ error: 'Venta no encontrada' });
      }
      
      res.json(venta);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener venta' });
    }
  }

  static async getPendientes(req: AuthRequest, res: Response) {
    try {
      const ventas = await VentaModel.findPendientes();
      res.json(ventas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener ventas pendientes' });
    }
  }

  static async getByCliente(req: AuthRequest, res: Response) {
    try {
      const clienteId = parseInt(req.params.clienteId);
      const ventas = await VentaModel.findByCliente(clienteId);
      res.json(ventas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener ventas del cliente' });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const nuevaVenta = {
        ...req.body,
        fecha: new Date()
      };
      
      const id = await VentaModel.create(nuevaVenta);
      res.status(201).json({ id, message: 'Venta creada exitosamente' });
    } catch (error) {
      console.error('Error al crear venta:', error);
      res.status(500).json({ error: 'Error al crear venta' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const actualizado = await VentaModel.update(id, req.body);
      
      if (!actualizado) {
        return res.status(404).json({ error: 'Venta no encontrada' });
      }
      
      res.json({ message: 'Venta actualizada exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar venta' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const eliminado = await VentaModel.delete(id);
      
      if (!eliminado) {
        return res.status(404).json({ error: 'Venta no encontrada' });
      }
      
      res.json({ message: 'Venta eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar venta' });
    }
  }

  static async getEstadisticasHoy(req: AuthRequest, res: Response) {
    try {
      const estadisticas = await VentaModel.getVentasHoy();
      res.json(estadisticas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
}