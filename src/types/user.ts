export interface User {
  id: string;
  nickname: string;
  email: string;
  password: string;
  creation_date?: Date;
}

export interface CreateUserDto {
  nickname: string;
  email: string;
  password: string;
}

export interface AuthenticateUserDto {
  email: string;
  password: string;
} 