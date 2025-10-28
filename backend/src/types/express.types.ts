import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}
