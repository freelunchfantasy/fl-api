import Router from 'express';
import { login, register } from './auth.routes.js';

export function authRoutes(bodyParser) {
  const router = Router();

  // POST request for attempting to login
  router.post('/login', bodyParser, login);

  // POST request for registering new user
  router.post('/register', bodyParser, register);

  return router;
}
