import { Response } from 'express';
import { AbonoModel } from '../models/Abono';
import { AuthRequest } from '../middleware/auth';

export class AbonoController {
  static async getByCliente(req: AuthRequest, res: Response) {
    try {
      const clienteId = parseInt(req.params.clienteId);
      const abonos = await AbonoModel.findByCliente(clienteId);
      res.json(abonos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener abonos del cliente' });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const nuevoAbono = {
        ...req.body,
        fecha: new Date()
      };
      
      const id = await AbonoModel.create(nuevoAbono);
      res.status(201).json({ id, message: 'Abono registrado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar abono' });
    }
  }

  static async getTotalAbonos(req: AuthRequest, res: Response) {
    try {
      const clienteId = parseInt(req.params.clienteId);
      const total = await AbonoModel.getTotalAbonosCliente(clienteId);
      res.json({ total });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener total de abonos' });
    }
  }
}