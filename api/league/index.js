import Router from 'express';
import league from './league.routes.js';

export default bodyParser => {
  const api = Router();
  const leagueFunctions = league();

  // GET request for retrieving user's user leagues
  api.get('/user-leagues', bodyParser, leagueFunctions.getUserLeagues);

  // POST request for saving a new user league
  api.post('/save-user-league', bodyParser, leagueFunctions.saveNewUserLeague);

  // POST request for retrieving user's league
  api.post('/get-league', bodyParser, leagueFunctions.getLeague);

  // POST request for simulating a league's ROS games
  api.post('/simulate', bodyParser, leagueFunctions.simulateLeague);

  // POST request for simulating a trade
  api.post('/simulate-trade', bodyParser, leagueFunctions.simulateTrade);

  // POST request for sending email with trade simulation results
  api.post('/share-trade-simulation', bodyParser, leagueFunctions.shareTradeSimulationResults);

  return api;
};
