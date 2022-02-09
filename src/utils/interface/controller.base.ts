import { Router } from 'express';

export interface ControllerBase {
  routes(): Router;
}
