import { Router } from 'express';
import bodyParser from 'body-parser';
import { login, register } from './auth.routes.js';

var jsonParser = bodyParser.json();

export default preRequestMiddlewareFn => {
  const auth = Router();

  preRequestMiddlewareFn(auth);

  // POST request for attempting to login
  auth.post('/login', jsonParser, login);

  // POST request for registering new user
  auth.post('/register', jsonParser, register);

  return auth;
};
