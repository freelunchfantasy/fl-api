import Router from 'express';
import { getGameUser } from './auth.routes.js';

export function authRoutes(bodyParser) {
  const router = Router();

  router.post('/game-user', bodyParser, getGameUser);

  return router;
}
