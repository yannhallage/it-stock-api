import { Router } from 'express';
import { SuppliersController } from './suppliers.controller';

export class SuppliersModule {
  public readonly router: Router;
  private readonly controller: SuppliersController;

  constructor() {
    this.router = Router();
    this.controller = new SuppliersController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', this.controller.create);
    this.router.get('/', this.controller.list);
    this.router.get('/:id', this.controller.getById);
    this.router.put('/:id', this.controller.update);
    this.router.delete('/:id', this.controller.delete);
  }
}

export const suppliersModule = new SuppliersModule();

