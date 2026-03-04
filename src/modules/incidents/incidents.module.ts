import { Router } from 'express';
import { IncidentsController } from './incidents.controller';

export class IncidentsModule {
  public readonly router: Router;
  private readonly controller: IncidentsController;

  constructor() {
    this.router = Router();
    this.controller = new IncidentsController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/incidents', this.controller.list);
    this.router.get('/incidents/:id', this.controller.getById);
    this.router.post('/assets/:id/incidents', this.controller.createForAsset);
    this.router.patch('/incidents/:id/status', this.controller.updateStatus);
  }
}

export const incidentsModule = new IncidentsModule();
