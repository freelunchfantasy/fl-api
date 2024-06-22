import { spawn } from 'child_process';
import logger from 'winston';
import EntitiesDbo from '../../db/sql-clients/entities-dbo.js';
import DataProcessingHelper from '../../helpers/data-processing-helper.js';
import SimulationHelper from '../../helpers/simulation-helper.js';
import SendgridHelper from '../../helpers/sendgrid-helper.js';
import DemoLeagueHelper from '../../helpers/demo-league-helper.js';
import LeagueDataHelper from '../../helpers/league-data-helper.js';

export default () => {
  // Local instances
  const dbo = new EntitiesDbo();
  const dataProcessingHelper = new DataProcessingHelper();
  const simulationHelper = new SimulationHelper();
  const sendgridHelper = new SendgridHelper();
  const demoLeagueHelper = new DemoLeagueHelper();
  const leagueDataHelper = new LeagueDataHelper();

  async function getUserLeagues(req, res, next) {
    logger.info(`Received request to get user leagues for user ${req.user.id}`);

    dbo
      .getUserLeagues(req.user.id)
      .then(result => {
        const userLeagues = dataProcessingHelper.processUserLeagues(result);
        res.json(userLeagues);
        return next();
      })
      .catch(err => {
        const errorMessage = `Something went wrong getting user leagues for user ${req.user.id}. Error: ${err}`;
        logger.info(errorMessage);
        res.sendStatus(500);
        res.json({ message: errorMessage });
        return next();
      });
  }

  async function checkUserLeague(req, res, next) {
    const userId = req.user.id;
    const { externalLeagueId, leagueSourceId } = req.body;
    logger.info(
      `Received request to check user league for user ${userId} with external league ${externalLeagueId} and league source ${leagueSourceId}`
    );

    dbo
      .checkUserLeague(userId, externalLeagueId, leagueSourceId)
      .then(result => {
        if (result.length) {
          res.json({
            foundExistingUserLeague: true,
          });
          next();
        } else {
          res.json({
            foundExistingUserLeague: false,
          });
          next();
        }
      })
      .catch(err => {
        logger.error(
          `Something went wrong checking user league for user ${userId} with external league ${externalLeagueId} and league source ${leagueSourceId}. Error: ${err}`
        );
        res.json({ error: err });
        next();
      });
  }

  async function saveNewUserLeague(req, res, next) {
    const userId = req.user.id;
    let { externalLeagueId, leagueName, userTeamId, userTeamName, userTeamRank, totalTeams, leagueSourceId } = req.body;
    logger.info(`Received request to save new user league for user ${userId} and external league ${externalLeagueId}`);
    if (!userTeamName) {
      // occurs when adding demo league
      const demoLeagueData = demoLeagueHelper.getDemoLeagueData();
      userTeamName = demoLeagueData.teams.find(t => t.id == userTeamId).teamName;
      userTeamRank = leagueDataHelper.determineTeamRank(demoLeagueData.teams, userTeamId);
    }

    dbo
      .saveNewUserLeague(
        userId,
        externalLeagueId,
        leagueName,
        userTeamId,
        userTeamName,
        userTeamRank,
        totalTeams,
        leagueSourceId
      )
      .then(result => {
        res.json(result.id);
        return next();
      })
      .catch(err => {
        const errorMessage = `Something went wrong saving new user league for user ${req.user.id} and external league ${externalLeagueId}. Error: ${err}`;
        logger.error(errorMessage);
        res.sendStatus(500);
        res.json({ message: errorMessage });
        return next();
      });
  }

  async function deleteUserLeague(req, res, next) {
    const { userLeagueId } = req.body;
    if (!userLeagueId) {
      logger.error(`Invalid request to delete user league.  Mising userLeagueId`);
      res.json({});
      return next();
    }
    logger.info(`Received request to delete user league ${userLeagueId}`);

    dbo
      .deleteUserLeague(userLeagueId)
      .then(result => {
        res.json({ success: true });
        return next();
      })
      .catch(err => {
        const errorMessage = `Something went wrong deleting user league with id ${userLeagueId}. Error: ${err}`;
        logger.error(errorMessage);
        res.sendStatus(500);
        res.json({ message: errorMessage, success: false });
        return next();
      });
  }

  /**
   * Method for getting ESPN league by ID
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  async function getLeague(req, res, next) {
    const { leagueId, userTeamId } = req.body;
    logger.info(`Received request from user ${req.user.id} to get league ${leagueId}`);
    if (leagueId == 1) {
      // If the requested league is the demo league
      const leagueData = demoLeagueHelper.getDemoLeagueData();
      syncUserLeague(leagueData, req.user.id, userTeamId, leagueId, 1); // 1 is for Demo
      res.json({ ...leagueData, foundLeague: true });
      return next();
    }
    const ls = spawn('python', ['python/get_league.py', leagueId]);

    new Promise((resolve, reject) => {
      // Listen to the `data` event on `stdout`.
      ls.stdout.on('data', data => resolve(`stdout: ${data}`));
      // Listen to the `data` event on `stderr`.
      ls.stderr.on('data', data => reject(`stderr: ${data}`));
    })
      .then(data => {
        logger.info(`Successfully retrieved data for league ${leagueId}`);
        const leagueData = JSON.parse(data.slice(data.indexOf('{')));
        if (userTeamId) syncUserLeague(leagueData, req.user.id, userTeamId, leagueId, 2); // 2 is for ESPN, update later
        res.json({ ...leagueData, foundLeague: true });
        next();
      })
      .catch(err => {
        logger.info(`Something went wrong loading league with external id ${leagueId}. Err: ${err}`);
        res.json({ foundLeague: false });
        next();
      });
  }

  async function getNflTeams(req, res, next) {
    logger.info(`Received request to get NFL teams from user ${req.user.id}`);
    dbo
      .getNflTeams()
      .then(result => {
        res.json(dataProcessingHelper.processNflTeams(result));
        next();
      })
      .catch(err => {
        logger.error(`Something went wrong getting NFL teams. Err: ${err}`);
        res.json([]);
        next();
      });
  }

  async function getLeagueSources(req, res, next) {
    logger.info(`Received request to get available league sources from user ${req.user.id}`);
    dbo
      .getLeagueSources()
      .then(result => {
        res.json(dataProcessingHelper.processLeagueSources(result));
        next();
      })
      .catch(err => {
        logger.error(`Something went wrong getting league sources. Err: ${err}`);
        res.json([]);
        next();
      });
  }

  /**
   * Method for simulating a league's ROS games
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async function simulateLeague(req, res, next) {
    const { id, teams, schedule } = req.body;
    logger.info(`Received request to simulate league with id: ${id}`);

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

  async function simulateTrade(req, res, next) {
    const leagueVersions = req.body;
    if (leagueVersions.length < 2) {
      logger.error(`Received bad request to simulate a league trade`);
      return next();
    }
    const userId = leagueVersions[0].userId;
    const userLeagueId = leagueVersions[0].userLeagueId;
    logger.info(`Received request to simulate trade for league with id: ${leagueVersions[0].id}`);
    simulationHelper
      .simulateTrade(leagueVersions)
      .then(result => {
        dbo.insertTradeSimulation(userId, userLeagueId);
        res.json(result);
        next();
      })
      .catch(err => {
        next(err);
      });
  }

  async function shareTradeSimulationResults(req, res, next) {
    const { userId, userLeagueId, targetEmail, leagueStandings, tradeBlock, tradeResult } = req.body;
    if (!userId || !userLeagueId || !targetEmail || !leagueStandings || !tradeBlock || !tradeResult) {
      const err = `Bad request to share trade simulation result from user ${userId}`;
      res.json({ err });
      return next();
    }

    logger.info(`Received request to share trade simulation result for user league ${userLeagueId}`);
    dbo
      .getUserAndLeagueNames(userId, userLeagueId)
      .then(result => {
        const leftTeam = leagueStandings.find(t => t.roster.find(p => p.id == tradeBlock.left[0].id));
        const rightTeam = leagueStandings.find(t => t.roster.find(p => p.id == tradeBlock.right[0].id));
        const left_win_diff = (
          tradeResult.after.find(t => t.id == leftTeam.id).wins - tradeResult.before.find(t => t.id == leftTeam.id).wins
        ).toFixed(2);
        const right_win_diff = (
          tradeResult.after.find(t => t.id == rightTeam.id).wins -
          tradeResult.before.find(t => t.id == rightTeam.id).wins
        ).toFixed(2);
        const inputs = {
          target_email: targetEmail,
          sender_name: `${result.first_name} ${result.last_name}`,
          league_name: result.league_name,
          left_team_name: leftTeam.teamName,
          right_team_name: rightTeam.teamName,
          left_players: tradeBlock.left,
          right_players: tradeBlock.right,
          left_win_diff: Math.abs(left_win_diff),
          right_win_diff: Math.abs(right_win_diff),
          left_win_diff_positive: left_win_diff >= 0,
          right_win_diff_positive: right_win_diff >= 0,
        };
        sendgridHelper.sendTradeSimulationResultEmail(inputs);
        logger.info(`Successfully sent trade simulation result email requested by user ${userId}. Saving record to DB`);
        dbo.insertTradeSimulationShare(userId, userLeagueId, targetEmail);
        res.json({});
        next();
      })
      .catch(err => {
        logger.error(`Something went wrong sending trade simulation result email. Err: ${err}`);
        res.json({ err });
        return next();
      });
  }

  function syncUserLeague(leagueData, userId, userTeamId, externalLeagueId, leagueSourceId) {
    const userTeamName = leagueData.teams.find(team => team.id == userTeamId).teamName;
    logger.info(userTeamName);
    const totalTeams = leagueData.teams.length;
    const userTeamRank = leagueDataHelper.determineTeamRank(leagueData.teams, userTeamId);
    dbo
      .syncUserLeagueData(userId, externalLeagueId, leagueSourceId, userTeamName, userTeamRank, totalTeams)
      .then(result => {
        logger.info(`Successfully synced user league for user ${userId}, external league ${externalLeagueId}`);
      })
      .catch(err => {
        logger.error(
          `Something went wrong syncing user league for ${userId}, external league ${externalLeagueId}. Error ${err}`
        );
      });
  }

  return {
    getLeague,
    getNflTeams,
    getLeagueSources,
    simulateLeague,
    getUserLeagues,
    checkUserLeague,
    saveNewUserLeague,
    deleteUserLeague,
    simulateTrade,
    shareTradeSimulationResults,
  };
};
