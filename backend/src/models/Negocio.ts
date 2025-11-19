import pool from '../config/database';

export interface Negocio {
  id?: number;
  nombre: string;
  telefono?: string;
  persona_contacto?: string;
  email?: string;
  direccion?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class NegocioModel {
  static async findOne(): Promise<Negocio | null> {
    try {
      const [result] = await pool.execute(
        'SELECT * FROM negocio ORDER BY id LIMIT 1'
      );
      const rows = result as any[];
      return rows.length > 0 ? (rows[0] as Negocio) : null;
    } catch (error) {
      console.error('Error en NegocioModel.findOne:', error);
      return null;
    }
  }

  static async create(negocio: Omit<Negocio, 'id'>): Promise<number> {
    const [result] = await pool.execute(
      `INSERT INTO negocio (nombre, telefono, persona_contacto, email, direccion) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        negocio.nombre,
        negocio.telefono,
        negocio.persona_contacto,
        negocio.email,
        negocio.direccion
      ]
    );
    return (result as any).insertId;
  }

  static async update(id: number, negocio: Partial<Negocio>): Promise<boolean> {
    const [result] = await pool.execute(
      `UPDATE negocio 
       SET nombre = ?, telefono = ?, persona_contacto = ?, email = ?, direccion = ?
       WHERE id = ?`,
      [
        negocio.nombre,
        negocio.telefono,
        negocio.persona_contacto,
        negocio.email,
        negocio.direccion,
        id
      ]
    );
    return (result as any).affectedRows > 0;
  }
}