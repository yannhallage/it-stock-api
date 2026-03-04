import { Router } from 'express';
import { WorkshopController } from './workshop.controller';

export class WorkshopModule {
  public readonly router: Router;
  private readonly controller: WorkshopController;

  constructor() {
    this.router = Router();
    this.controller = new WorkshopController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/atelier/repairs', this.controller.listRepairs);
    this.router.post('/atelier/repairs/start', this.controller.startRepair);
    this.router.get('/atelier/repairs/:id', this.controller.getRepairById);
    this.router.patch('/atelier/repairs/:id/close', this.controller.closeRepair);
  }
}

export const workshopModule = new WorkshopModule();
