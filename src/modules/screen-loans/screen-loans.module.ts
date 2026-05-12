import { Router } from 'express';
import { ScreenLoansController } from './screen-loans.controller';

export class ScreenLoansModule {
  public readonly router: Router;
  private readonly controller: ScreenLoansController;

  constructor() {
    this.router = Router();
    this.controller = new ScreenLoansController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', this.controller.create);
    this.router.get('/', this.controller.list);
    this.router.patch('/:id/return', this.controller.markReturned);
  }
}

export const screenLoansModule = new ScreenLoansModule();

