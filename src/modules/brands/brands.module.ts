import { Router } from 'express';
import { BrandsController } from './brands.controller';

export class BrandsModule {
  public readonly router: Router;
  private readonly controller: BrandsController;

  constructor() {
    this.router = Router();
    this.controller = new BrandsController();
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

export const brandsModule = new BrandsModule();
