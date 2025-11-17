import pool from '../config/database';

export interface Producto {
  id?: number;
  proveedor_id: number;
  nombre: string;
  descripcion?: string;
  valor: number;
  estado: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class ProductoModel {
  static async findAll(): Promise<Producto[]> {
    const [rows] = await pool.execute(
      `SELECT p.*, pr.nombre as proveedor_nombre 
       FROM productos p 
       JOIN proveedores pr ON p.proveedor_id = pr.id 
       WHERE p.estado = true 
       ORDER BY p.nombre`
    );
    return rows as Producto[];
  }

  static async findById(id: number): Promise<Producto | null> {
    const [rows] = await pool.execute(
      `SELECT p.*, pr.nombre as proveedor_nombre 
       FROM productos p 
       JOIN proveedores pr ON p.proveedor_id = pr.id 
       WHERE p.id = ? AND p.estado = true`,
      [id]
    );
    const productos = rows as Producto[];
    return productos.length > 0 ? productos[0] : null;
  }

  static async findByProveedor(proveedorId: number): Promise<Producto[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM productos WHERE proveedor_id = ? AND estado = true ORDER BY nombre',
      [proveedorId]
    );
    return rows as Producto[];
  }

  static async create(producto: Omit<Producto, 'id'>): Promise<number> {
    const [result] = await pool.execute(
      `INSERT INTO productos (proveedor_id, nombre, descripcion, valor, estado) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        producto.proveedor_id,
        producto.nombre,
        producto.descripcion,
        producto.valor,
        producto.estado
      ]
    );
    return (result as any).insertId;
  }

  static async update(id: number, producto: Partial<Producto>): Promise<boolean> {
    const [result] = await pool.execute(
      `UPDATE productos 
       SET proveedor_id = ?, nombre = ?, descripcion = ?, valor = ?
       WHERE id = ? AND estado = true`,
      [
        producto.proveedor_id,
        producto.nombre,
        producto.descripcion,
        producto.valor,
        id
      ]
    );
    return (result as any).affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute(
      'UPDATE productos SET estado = false WHERE id = ?',
      [id]
    );
    return (result as any).affectedRows > 0;
  }
}