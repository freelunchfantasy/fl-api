import { Router } from 'express';
import bodyParser from 'body-parser';
import { login, register, sendContactEmail } from './auth.routes.js';

var jsonParser = bodyParser.json();

export default (preRequestMiddlewareFn, postRequestMiddlewareFn) => {
  const auth = Router();

  preRequestMiddlewareFn(auth);

  // POST request for attempting to login
  auth.post('/login', jsonParser, login);

  // POST request for registering new user
  auth.post('/register', jsonParser, register);

  // POST request for sending contact email
  auth.post('/send-contact-email', jsonParser, sendContactEmail);

  postRequestMiddlewareFn(auth);
  return auth;
};
