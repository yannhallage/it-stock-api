import { Router } from 'express';
import { ImpressionController } from './impression.controller';

export class ImpressionModule {
  public readonly router: Router;
  private readonly controller: ImpressionController;

  constructor() {
    this.router = Router();
    this.controller = new ImpressionController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/printAssets', this.controller.printAssets);
    this.router.get('/printAssigment', this.controller.printAssigment);
    this.router.get('/printSuppliers', this.controller.printSuppliers);
    this.router.get('/printIncidents', this.controller.printIncidents);
  }
}

export const impressionModule = new ImpressionModule();
