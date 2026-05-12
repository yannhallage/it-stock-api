import { Router } from 'express';
import { DashboardController } from './dashboard.controller';

export class DashboardModule {
  public readonly router: Router;
  private readonly controller: DashboardController;

  constructor() {
    this.router = Router();
    this.controller = new DashboardController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.controller.getDashboard);
    this.router.get('/machines-stats', this.controller.getMachinesStats);
  }
}

export const dashboardModule = new DashboardModule();
