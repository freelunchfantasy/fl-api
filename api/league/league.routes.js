import { spawn } from 'child_process';
import SimulationHelper from '../../helpers/simulation-helper.js';

// Local instances
const simulationHelper = new SimulationHelper();

/**
 * Method for getting ESPN league by ID
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export async function getLeague(req, res, next) {
  const { id } = req.body;
  console.log(`Received request to get league for id: ${id}`);

  const ls = spawn('python', ['python/get_league.py', id]);

  new Promise((resolve, reject) => {
    // Listen to the `data` event on `stdout`.
    ls.stdout.on('data', data => resolve(`stdout: ${data}`));
    // Listen to the `data` event on `srderr`.
    ls.stderr.on('data', data => reject(`stdout: ${data}`));
  })
    .then(data => {
      res.json(JSON.parse(data.slice(data.indexOf('{'))));
      next();
    })
    .catch(err => next(err));
}

/**
 * Method for simulating a league's ROS games
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export async function simulateLeague(req, res, next) {
  const { id, teams, schedule } = req.body;
  console.log(`Received request to simulate league with id: ${id}`);

  simulationHelper
    .simulateLeague(teams, schedule)
    .then(result => {
      res.json({ id, teamResults: result });
      next();
    })
    .catch(err => {
      next(err);
    });
}
