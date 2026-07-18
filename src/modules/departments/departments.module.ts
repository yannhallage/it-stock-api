import { Router } from 'express';
import { DepartmentsController } from './departments.controller';

export class DepartmentsModule {
  public readonly router: Router;
  private readonly controller: DepartmentsController;

  constructor() {
    this.router = Router();
    this.controller = new DepartmentsController();
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

export const departmentsModule = new DepartmentsModule();
