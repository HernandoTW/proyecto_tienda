import pool from '../config/database';

export interface VentaDiaria {
  id?: number;
  cliente_id?: number;
  fecha?: Date;
  valor_total: number;
  tipo_venta: 'contado' | 'credito' | 'pendiente';
  medio_pago: 'efectivo' | 'transferencia' | 'n/a';
  estado: 'completada' | 'pendiente';
  descripcion: string;
  created_at?: Date;
  updated_at?: Date;
}

export class VentaModel {
  static async findAll(): Promise<VentaDiaria[]> {
    const [rows] = await pool.execute(
      `SELECT v.*, c.nombre as cliente_nombre, c.alias as cliente_alias 
       FROM ventas_diarias v 
       LEFT JOIN clientes c ON v.cliente_id = c.id 
       ORDER BY v.fecha DESC`
    );
    return rows as VentaDiaria[];
  }

  static async findById(id: number): Promise<VentaDiaria | null> {
    const [rows] = await pool.execute(
      `SELECT v.*, c.nombre as cliente_nombre, c.alias as cliente_alias 
       FROM ventas_diarias v 
       LEFT JOIN clientes c ON v.cliente_id = c.id 
       WHERE v.id = ?`,
      [id]
    );
    const ventas = rows as VentaDiaria[];
    return ventas.length > 0 ? ventas[0] : null;
  }

  static async findByCliente(clienteId: number): Promise<VentaDiaria[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ventas_diarias 
       WHERE cliente_id = ? 
       ORDER BY fecha DESC`,
      [clienteId]
    );
    return rows as VentaDiaria[];
  }

  static async findPendientes(): Promise<VentaDiaria[]> {
  const [rows] = await pool.execute(
    `SELECT v.*, c.nombre as cliente_nombre, c.alias as cliente_alias, c.telefono as cliente_telefono 
     FROM ventas_diarias v 
     LEFT JOIN clientes c ON v.cliente_id = c.id 
     WHERE v.estado = 'pendiente' 
     ORDER BY v.fecha DESC`
  );
  return rows as VentaDiaria[];
  }

  static async create(venta: Omit<VentaDiaria, 'id'>): Promise<number> {
    const [result] = await pool.execute(
      `INSERT INTO ventas_diarias 
       (cliente_id, valor_total, tipo_venta, medio_pago, estado, descripcion) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        venta.cliente_id,
        venta.valor_total,
        venta.tipo_venta,
        venta.medio_pago,
        venta.estado,
        venta.descripcion
      ]
    );
    return (result as any).insertId;
  }

  static async update(id: number, venta: Partial<VentaDiaria>): Promise<boolean> {
    const [result] = await pool.execute(
      `UPDATE ventas_diarias 
       SET cliente_id = ?, valor_total = ?, tipo_venta = ?, medio_pago = ?, estado = ?, descripcion = ?
       WHERE id = ?`,
      [
        venta.cliente_id,
        venta.valor_total,
        venta.tipo_venta,
        venta.medio_pago,
        venta.estado,
        venta.descripcion,
        id
      ]
    );
    return (result as any).affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM ventas_diarias WHERE id = ?',
      [id]
    );
    return (result as any).affectedRows > 0;
  }

  static async getVentasHoy(): Promise<{ total: number, count: number }> {
    const [rows] = await pool.execute(
      `SELECT 
        COALESCE(SUM(valor_total), 0) as total,
        COUNT(*) as count
       FROM ventas_diarias 
       WHERE DATE(fecha) = CURDATE() AND estado = 'completada'`
    );
    const resultados = rows as any[];
    return resultados.length > 0 ? resultados[0] : { total: 0, count: 0 };
  }
}