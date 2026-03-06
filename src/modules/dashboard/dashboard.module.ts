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
  }
}

export const dashboardModule = new DashboardModule();
