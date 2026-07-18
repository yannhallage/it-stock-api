import { Router } from 'express';
import { CategoriesController } from './categories.controller';

export class CategoriesModule {
  public readonly router: Router;
  private readonly controller: CategoriesController;

  constructor() {
    this.router = Router();
    this.controller = new CategoriesController();
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

export const categoriesModule = new CategoriesModule();
