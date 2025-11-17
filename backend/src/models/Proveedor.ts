import pool from '../config/database';

export interface Proveedor {
  id?: number;
  nombre: string;
  telefono?: string;
  estado: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class ProveedorModel {
  static async findAll(): Promise<Proveedor[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM proveedores WHERE estado = true ORDER BY nombre'
    );
    return rows as Proveedor[];
  }

  static async findById(id: number): Promise<Proveedor | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM proveedores WHERE id = ? AND estado = true',
      [id]
    );
    const proveedores = rows as Proveedor[];
    return proveedores.length > 0 ? proveedores[0] : null;
  }

  static async create(proveedor: Omit<Proveedor, 'id'>): Promise<number> {
    const [result] = await pool.execute(
      'INSERT INTO proveedores (nombre, telefono, estado) VALUES (?, ?, ?)',
      [proveedor.nombre, proveedor.telefono, proveedor.estado]
    );
    return (result as any).insertId;
  }

  static async update(id: number, proveedor: Partial<Proveedor>): Promise<boolean> {
    const [result] = await pool.execute(
      'UPDATE proveedores SET nombre = ?, telefono = ? WHERE id = ? AND estado = true',
      [proveedor.nombre, proveedor.telefono, id]
    );
    return (result as any).affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute(
      'UPDATE proveedores SET estado = false WHERE id = ?',
      [id]
    );
    return (result as any).affectedRows > 0;
  }
}