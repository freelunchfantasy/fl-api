import Router from 'express';
import { getLeague } from './app.routes.js';

export function appRoutes(bodyParser) {
  const router = Router();

  // POST request for retrieving user's league
  router.post('/league', bodyParser, getLeague);

  return router;
}
