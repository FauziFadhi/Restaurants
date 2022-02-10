import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import 'reflect-metadata';
import { container } from 'tsyringe';
import db from './config/database.config';
import { elasticIndexMapping } from './config/elastic.config';
import { PurchaseController } from './controllers/purchase.controller';
import { RestaurantController } from './controllers/restaurant.controller';
import { SearchController } from './controllers/search.controller';

// env
dotenv.config();
// database sync
db.authenticate();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => res.send('Hello World'));
app.get('/migrate/zloDtgPy0T', async (_: Request, res: Response) => {
  await elasticIndexMapping();
  res.send('migrated');
});

app.use('/restaurants', container.resolve(RestaurantController).routes());
app.use('/search', container.resolve(SearchController).routes());
app.use('/purchase', container.resolve(PurchaseController).routes());

app.use(function (err, _, res, __) {
  console.log('\x1b[36m', err.stack, '\x1b[0m');

  const statusCode = err.statusCode || 500;
  res.status(statusCode).send({
    message: err.message || 'Internal Server Error!',
    statusCode: statusCode,
  });
});
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
