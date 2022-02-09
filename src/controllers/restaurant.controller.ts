import { Request, Response, Router } from 'express';
import { autoInjectable } from 'tsyringe';
import { RestaurantService } from '../service/restaurant.service';
import { ControllerBase } from '../utils/interface/controller.base';

@autoInjectable()
export class RestaurantController implements ControllerBase {
  private router: Router;
  constructor(private readonly service: RestaurantService) {
    this.router = Router();
  }
  routes(): Router {
    this.router.get('/', async (req: Request, res: Response) => {
      return res.send(await this.listRestaurant(req));
    });
    this.router.get('/:id', async (req: Request, res: Response) => {
      return res.send(await this.findById(req));
    });

    return this.router;
  }

  async listRestaurant({ query }: Request) {
    return this.service.listRestaurant(query as any);
  }

  async findById({ params }: Request) {
    return this.service.findById(params.id);
  }
}
