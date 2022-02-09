import { Request, Response, Router } from 'express';
import { SearchService } from 'src/service/search.service';
import { autoInjectable } from 'tsyringe';
import { ControllerBase } from '../utils/interface/controller.base';

@autoInjectable()
export class SearchController implements ControllerBase {
  private router: Router;
  constructor(private readonly service: SearchService) {
    this.router = Router();
  }
  routes(): Router {
    this.router.get('/:type', async (req: Request, res: Response) => {
      return res.send(await this.search(req));
    });

    return this.router;
  }

  async search({ query, params }: Request) {
    return this.service.search(params.type as any,query as any);
  }
}
