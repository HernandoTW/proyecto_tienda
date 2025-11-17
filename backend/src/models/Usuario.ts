import pool from '../config/database';
import bcrypt from 'bcryptjs';

export interface Usuario {
  id?: number;
  username: string;
  email: string;
  password_hash: string;
  nombre: string;
  rol: 'admin' | 'tendero';
  estado: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class UsuarioModel {
  static async findByUsername(username: string): Promise<Usuario | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE username = ? AND estado = true',
      [username]
    );
    const usuarios = rows as Usuario[];
    return usuarios.length > 0 ? usuarios[0] : null;
  }

  static async findById(id: number): Promise<Usuario | null> {
    const [rows] = await pool.execute(
      'SELECT id, username, email, nombre, rol, created_at FROM usuarios WHERE id = ? AND estado = true',
      [id]
    );
    const usuarios = rows as Usuario[];
    return usuarios.length > 0 ? usuarios[0] : null;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}