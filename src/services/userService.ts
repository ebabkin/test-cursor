import { pool } from '../config/database';
import { User, CreateUserDto, AuthenticateUserDto } from '../types/user';
import bcrypt from 'bcrypt';

export class UserService {
  async createUser(userData: CreateUserDto): Promise<User> {
    // Check both email and nickname uniqueness
    const [emailExists, nicknameExists] = await Promise.all([
      this.isEmailTaken(userData.email),
      this.isNicknameTaken(userData.nickname)
    ]);

    if (emailExists) {
      throw new Error('Email already registered');
    }

    if (nicknameExists) {
      throw new Error('Nickname already taken');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (id, nickname, email, password) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *',
      [userData.nickname, userData.email, hashedPassword]
    );
    
    return result.rows[0];
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, nickname, email, creation_date FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  async authenticateUser(credentials: AuthenticateUserDto): Promise<User | null> {
    // Modified to support both email and nickname authentication
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR nickname = $1',
      [credentials.email] // email field now accepts either email or nickname
    );
    
    const user = result.rows[0];
    if (!user) return null;

    const validPassword = await bcrypt.compare(credentials.password, user.password);
    if (!validPassword) return null;

    delete user.password;
    return user;
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM users WHERE email = $1',
      [email]
    );
    return parseInt(result.rows[0].count) > 0;
  }

  async isNicknameTaken(nickname: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM users WHERE nickname = $1',
      [nickname]
    );
    return parseInt(result.rows[0].count) > 0;
  }
} 