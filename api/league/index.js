import Router from 'express';
import league from './league.routes.js';

export default bodyParser => {
  const api = Router();
  const leagueFunctions = league();

  // POST request for retrieving user's league
  api.post('/get-league', bodyParser, leagueFunctions.getLeague);

  // POST request for simulating a league's ROS games
  api.post('/simulate', bodyParser, leagueFunctions.simulateLeague);

  return api;
};
