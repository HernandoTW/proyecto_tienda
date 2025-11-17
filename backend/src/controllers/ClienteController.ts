import { Response } from 'express';
import { ClienteModel } from '../models/Cliente';
import { AuthRequest } from '../middleware/auth';

export class ClienteController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const clientes = await ClienteModel.findAll();
      res.json(clientes);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({ error: 'Error al obtener clientes' });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const cliente = await ClienteModel.findById(id);
      
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener cliente' });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const nuevoCliente = {
        ...req.body,
        estado: true
      };
      
      const id = await ClienteModel.create(nuevoCliente);
      res.status(201).json({ id, message: 'Cliente creado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear cliente' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const actualizado = await ClienteModel.update(id, req.body);
      
      if (!actualizado) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      
      res.json({ message: 'Cliente actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar cliente' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const eliminado = await ClienteModel.delete(id);
      
      if (!eliminado) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      
      res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar cliente' });
    }
  }

  static async getSaldo(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const saldo = await ClienteModel.getSaldoCliente(id);
      
      if (!saldo) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      
      res.json(saldo);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener saldo del cliente' });
    }
  }
}