import Router from 'express';
import { getLeague, simulateLeague } from './league.routes.js';

export default bodyParser => {
  const router = Router();

  // POST request for retrieving user's league
  router.post('/get-league', bodyParser, getLeague);

  // POST request for simulating a league's ROS games
  router.post('/simulate', bodyParser, simulateLeague);

  return router;
};
