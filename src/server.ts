import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import 'reflect-metadata';
import { container } from 'tsyringe';
import db from './config/database.config';
import { elasticIndexMapping } from './config/elastic.config';
import { RestaurantController } from './controllers/restaurant.controller';

// env
dotenv.config();
// database sync
db.authenticate();

const app = express();
const PORT = 8000;

app.get('/', (req: Request, res: Response) => res.send('Hello World'));
app.get('/migrate/zloDtgPy0T', async (_: Request, __: Response) => {
  elasticIndexMapping();
});

app.use('/restaurants', container.resolve(RestaurantController).routes());
app.use(function (err, _, res, __) {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).send({
    message: err.message || 'Internal Server Error!',
    statusCode: statusCode,
  });
});
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});