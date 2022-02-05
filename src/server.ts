import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import 'reflect-metadata';
import db from './config/database.config';

// env
dotenv.config()
// database sync
db.authenticate()

const app = express();
const PORT = 8000;

app.get('/', (req: Request,res: Response) => res.send('Hello World'));
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});