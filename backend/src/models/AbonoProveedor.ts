import pool from '../config/database';

export interface PagoProveedor {
  id?: number;
  proveedor_id: number;
  fecha?: Date;
  valor: number;
  descripcion?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class PagoProveedorModel {
  static async findByProveedor(proveedorId: number): Promise<PagoProveedor[]> {
    const [rows] = await pool.execute(
      `SELECT p.*, pr.nombre as proveedor_nombre 
       FROM pagos_proveedores p 
       JOIN proveedores pr ON p.proveedor_id = pr.id 
       WHERE p.proveedor_id = ? 
       ORDER BY p.fecha DESC`,
      [proveedorId]
    );
    return rows as PagoProveedor[];
  }

  static async create(pago: Omit<PagoProveedor, 'id'>): Promise<number> {
    const [result] = await pool.execute(
      'INSERT INTO pagos_proveedores (proveedor_id, valor, descripcion) VALUES (?, ?, ?)',
      [pago.proveedor_id, pago.valor, pago.descripcion]
    );
    return (result as any).insertId;
  }

  static async getTotalPagosProveedor(proveedorId: number): Promise<number> {
    const [rows] = await pool.execute(
      'SELECT COALESCE(SUM(valor), 0) as total FROM pagos_proveedores WHERE proveedor_id = ?',
      [proveedorId]
    );
    const resultados = rows as any[];
    return resultados.length > 0 ? parseFloat(resultados[0].total) : 0;
  }
}