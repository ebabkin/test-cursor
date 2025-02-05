import { pool } from '../config/database';
import { User } from '../types/user';
import bcrypt from 'bcrypt';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

export class UserService {
  async checkUserExists(email: string, username: string): Promise<{ emailExists: boolean; usernameExists: boolean }> {
    const emailResult = await pool.query(
      'SELECT COUNT(*) FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    const usernameResult = await pool.query(
      'SELECT COUNT(*) FROM users WHERE username = $1',
      [username.toLowerCase()]
    );
    
    return {
      emailExists: parseInt(emailResult.rows[0].count) > 0,
      usernameExists: parseInt(usernameResult.rows[0].count) > 0
    };
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const { emailExists, usernameExists } = await this.checkUserExists(userData.email, userData.username);
    
    if (emailExists) {
      throw new Error('Email already exists');
    }
    if (usernameExists) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [
        userData.username.toLowerCase(),
        userData.email.toLowerCase(),
        hashedPassword
      ]
    );

    return result.rows[0];
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  async authenticateUser(identifier: string, password: string): Promise<User | null> {
    // Allow login with either email or username
    const result = await pool.query(
      `SELECT * FROM users 
       WHERE email = $1 OR username = $1`,
      [identifier.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
} 