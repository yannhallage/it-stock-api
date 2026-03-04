import { Router } from 'express';
import { StocksController } from './stocks.controller';

export class StocksModule {
  public readonly router: Router;
  private readonly controller: StocksController;

  constructor() {
    this.router = Router();
    this.controller = new StocksController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', this.controller.create);
    this.router.get('/', this.controller.list);
    this.router.get('/:id', this.controller.getById);
    this.router.delete('/:id', this.controller.delete);
  }
}

export const stocksModule = new StocksModule();

