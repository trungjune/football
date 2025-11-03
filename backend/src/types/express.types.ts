import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  phone: string;
  image: string;
  member?: {
    id: string;
    fullName: string;
  } | null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}
