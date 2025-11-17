import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/Usuario';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/auth';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }

      const usuario = await UsuarioModel.findByUsername(username);
      
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const isValidPassword = await UsuarioModel.verifyPassword(password, usuario.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { 
          userId: usuario.id, 
          username: usuario.username,
          rol: usuario.rol 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        token,
        user: {
          id: usuario.id,
          username: usuario.username,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async getProfile(req: any, res: Response) {
    try {
      const usuario = await UsuarioModel.findById(req.user.id);
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }
}