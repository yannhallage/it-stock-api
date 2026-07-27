import { Router } from 'express';
import { EmployeesController } from './employees.controller';

export class EmployeesModule {
  public readonly router: Router;
  private readonly controller: EmployeesController;

  constructor() {
    this.router = Router();
    this.controller = new EmployeesController();
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

export const employeesModule = new EmployeesModule();
