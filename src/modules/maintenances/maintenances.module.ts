import { Router } from 'express';
import { MaintenancesController } from './maintenances.controller';

export class MaintenancesModule {
  public readonly router: Router;
  private readonly controller: MaintenancesController;

  constructor() {
    this.router = Router();
    this.controller = new MaintenancesController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', this.controller.create);
    this.router.get('/', this.controller.list);
    this.router.get('/:id', this.controller.getById);
    this.router.put('/:id', this.controller.update);
    this.router.patch('/:id/status', this.controller.updateStatus);
    this.router.delete('/:id', this.controller.delete);
  }
}

export const maintenancesModule = new MaintenancesModule();
