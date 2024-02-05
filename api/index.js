import { Router } from 'express';
import bodyParser from 'body-parser';
import league from './league/index.js';

// TO-DO: entities dbo stuff

var jsonParser = bodyParser.json();

export default (preRequestMiddlewareFn, postRequestMiddlewareFn) => {
  let api = Router();

  preRequestMiddlewareFn(api);

  // League endpoints
  const leagueEndpoints = league(jsonParser);
  api.use('/league', leagueEndpoints);

  postRequestMiddlewareFn(api);
  return api;
};
