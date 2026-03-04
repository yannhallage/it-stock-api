import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from './auth.middleware';

export class AuthModule {
  public readonly router: Router;
  private readonly controller: AuthController;

  constructor() {
    this.router = Router();
    this.controller = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/register', this.controller.register);
    this.router.post('/login', this.controller.login);
    this.router.get('/me', authenticate, this.controller.me);
  }
}

export const authModule = new AuthModule();

