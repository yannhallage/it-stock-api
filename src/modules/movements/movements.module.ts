import { Router } from 'express';
import { MovementsController } from './movements.controller';

export class MovementsModule {
  public readonly router: Router;
  private readonly controller: MovementsController;

  constructor() {
    this.router = Router();
    this.controller = new MovementsController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', this.controller.create);
    this.router.get('/', this.controller.list);
    this.router.get('/:id', this.controller.getById);
  }
}

export const movementsModule = new MovementsModule();
