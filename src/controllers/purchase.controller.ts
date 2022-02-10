import { Request, Response, Router } from 'express';
import { PurchaseService } from 'src/service/purchase.service';
import { autoInjectable } from 'tsyringe';
import { ControllerBase } from '../utils/interface/controller.base';

@autoInjectable()
export class PurchaseController implements ControllerBase {
  private router: Router;
  constructor(private readonly service: PurchaseService) {
    this.router = Router();
  }
  routes(): Router {
    this.router.post('/', async (req: Request, res: Response) => {
      return res.send(await this.purchase(req));
    });

    return this.router;
  }

  async purchase({ body }: Request) {
    return await this.service.purchase(body);
  }
}
