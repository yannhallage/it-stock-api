import { Router } from 'express';
import { LocationsController } from './locations.controller';

export class LocationsModule {
  public readonly router: Router;
  private readonly controller: LocationsController;

  constructor() {
    this.router = Router();
    this.controller = new LocationsController();
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

export const locationsModule = new LocationsModule();
