import pool from '../config/database';

export interface Cliente {
  id?: number;
  nombre: string;
  alias?: string;
  telefono?: string;
  direccion?: string;
  limite_credito: number;
  cliente_regular: boolean;
  estado: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class ClienteModel {
  static async findAll(): Promise<Cliente[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM clientes WHERE estado = true ORDER BY nombre'
    );
    return rows as Cliente[];
  }

  static async findById(id: number): Promise<Cliente | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM clientes WHERE id = ? AND estado = true',
      [id]
    );
    const clientes = rows as Cliente[];
    return clientes.length > 0 ? clientes[0] : null;
  }

  static async create(cliente: Omit<Cliente, 'id'>): Promise<number> {
    const [result] = await pool.execute(
      `INSERT INTO clientes (nombre, alias, telefono, direccion, limite_credito, cliente_regular, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        cliente.nombre,
        cliente.alias,
        cliente.telefono,
        cliente.direccion,
        cliente.limite_credito,
        cliente.cliente_regular,
        cliente.estado
      ]
    );
    return (result as any).insertId;
  }

  static async update(id: number, cliente: Partial<Cliente>): Promise<boolean> {
    const [result] = await pool.execute(
      `UPDATE clientes 
       SET nombre = ?, alias = ?, telefono = ?, direccion = ?, limite_credito = ?, cliente_regular = ?
       WHERE id = ? AND estado = true`,
      [
        cliente.nombre,
        cliente.alias,
        cliente.telefono,
        cliente.direccion,
        cliente.limite_credito,
        cliente.cliente_regular,
        id
      ]
    );
    return (result as any).affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute(
      'UPDATE clientes SET estado = false WHERE id = ?',
      [id]
    );
    return (result as any).affectedRows > 0;
  }

  static async getSaldoCliente(clienteId: number): Promise<any> {
    const [rows] = await pool.execute(
      `SELECT 
        c.limite_credito,
        COALESCE(SUM(CASE WHEN v.tipo_venta = 'credito' THEN v.valor_total ELSE 0 END), 0) as deuda_total,
        COALESCE(SUM(a.valor), 0) as abonos_total,
        (COALESCE(SUM(CASE WHEN v.tipo_venta = 'credito' THEN v.valor_total ELSE 0 END), 0) - COALESCE(SUM(a.valor), 0)) as saldo_actual
       FROM clientes c
       LEFT JOIN ventas_diarias v ON v.cliente_id = c.id AND v.estado = 'completada'
       LEFT JOIN abonos a ON a.cliente_id = c.id
       WHERE c.id = ?
       GROUP BY c.id, c.limite_credito`,
      [clienteId]
    );
    const resultados = rows as any[];
    return resultados.length > 0 ? resultados[0] : null;
  }
}