import pool from '../config/database';

export interface Abono {
  id?: number;
  cliente_id: number;
  fecha?: Date;
  valor: number;
  descripcion?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class AbonoModel {
  static async findByCliente(clienteId: number): Promise<Abono[]> {
    const [rows] = await pool.execute(
      `SELECT a.*, c.nombre as cliente_nombre 
       FROM abonos a 
       JOIN clientes c ON a.cliente_id = c.id 
       WHERE a.cliente_id = ? 
       ORDER BY a.fecha DESC`,
      [clienteId]
    );
    return rows as Abono[];
  }

  static async create(abono: Omit<Abono, 'id'>): Promise<number> {
    const [result] = await pool.execute(
      'INSERT INTO abonos (cliente_id, valor, descripcion) VALUES (?, ?, ?)',
      [abono.cliente_id, abono.valor, abono.descripcion]
    );
    return (result as any).insertId;
  }

  static async getTotalAbonosCliente(clienteId: number): Promise<number> {
    const [rows] = await pool.execute(
      'SELECT COALESCE(SUM(valor), 0) as total FROM abonos WHERE cliente_id = ?',
      [clienteId]
    );
    const resultados = rows as any[];
    return resultados.length > 0 ? parseFloat(resultados[0].total) : 0;
  }
}