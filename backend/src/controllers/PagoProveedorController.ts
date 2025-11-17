import { Response } from 'express';
import { PagoProveedorModel } from '../models/PagoProveedor';
import { AuthRequest } from '../middleware/auth';

export class PagoProveedorController {
  static async getByProveedor(req: AuthRequest, res: Response) {
    try {
      const proveedorId = parseInt(req.params.proveedorId);
      const pagos = await PagoProveedorModel.findByProveedor(proveedorId);
      res.json(pagos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener pagos del proveedor' });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const nuevoPago = {
        ...req.body,
        fecha: new Date()
      };
      
      const id = await PagoProveedorModel.create(nuevoPago);
      res.status(201).json({ id, message: 'Pago registrado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar pago' });
    }
  }

  static async getTotalPagos(req: AuthRequest, res: Response) {
    try {
      const proveedorId = parseInt(req.params.proveedorId);
      const total = await PagoProveedorModel.getTotalPagosProveedor(proveedorId);
      res.json({ total });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener total de pagos' });
    }
  }
}