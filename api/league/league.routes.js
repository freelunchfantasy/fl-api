import { spawn } from 'child_process';
import logger from 'winston';
import EntitiesDbo from '../../db/sql-clients/entities-dbo.js';
import DataProcessingHelper from '../../helpers/data-processing-helper.js';
import SimulationHelper from '../../helpers/simulation-helper.js';
import SendgridHelper from '../../helpers/sendgrid-helper.js';

export default () => {
  // Local instances
  const dbo = new EntitiesDbo();
  const dataProcessingHelper = new DataProcessingHelper();
  const simulationHelper = new SimulationHelper();
  const sendgridHelper = new SendgridHelper();

  async function getUserLeagues(req, res, next) {
    logger.info(`Received request to get user leagues for user ${req.user.id}`);

    dbo
      .getUserLeagues(req.user.id)
      .then(result => {
        setTimeout(() => {
          const userLeagues = dataProcessingHelper.processUserLeagues(result);
          res.json(userLeagues);
          return next();
        }, 1000);
        /*
        const userLeagues = dataProcessingHelper.processUserLeagues(result);
        res.json(userLeagues);
        return next();*/
      })
      .catch(err => {
        const errorMessage = `Something went wrong getting user leagues for user ${req.user.id}. Error: ${err}`;
        logger.info(errorMessage);
        res.sendStatus(500);
        res.json({ message: errorMessage });
        return next();
      });
  }

  async function saveNewUserLeague(req, res, next) {
    const userId = req.user.id;
    const { externalLeagueId, leagueName, userTeamId } = req.body;
    logger.info(`Received request to save new user league for user ${userId} and external league ${externalLeagueId}`);

    dbo
      .saveNewUserLeague(userId, externalLeagueId, leagueName, userTeamId)
      .then(result => {
        res.json(result.id);
        return next();
      })
      .catch(err => {
        const errorMessage = `Something went wrong saving new user league for user ${req.user.id} and external league ${externalLeagueId}. Error: ${err}`;
        logger.info(errorMessage);
        res.sendStatus(500);
        res.json({ message: errorMessage });
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
    const { id } = req.body;
    logger.info(`Received request from user ${req.user.id} to get league ${id}`);

    setTimeout(() => {
      res.json({ ...mockLeagueData(), foundLeague: true });
    }, 1000);
    /* - UNCOMMENT THIS WHEN LEAGUE IS BACK IN THE FALL
    const ls = spawn('python', ['python/get_league.py', id]);

    new Promise((resolve, reject) => {
      // Listen to the `data` event on `stdout`.
      ls.stdout.on('data', data => resolve(`stdout: ${data}`));
      // Listen to the `data` event on `stderr`.
      ls.stderr.on('data', data => reject(`stderr: ${data}`));
    })
      .then(data => {
        res.json({ ...JSON.parse(data.slice(data.indexOf('{'))), foundLeague: true });
        next();
      })
      .catch(err => {
        logger.info(`Something went wrong loading league with external id ${id}. Err: ${err}`);
        res.json({ foundLeague: false });
        next();
      });
      */
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
    logger.info(`Received request to simulate trade for league with id: ${leagueVersions[0].id}`);
    simulationHelper
      .simulateTrade(leagueVersions)
      .then(result => {
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
        res.json({});
        next();
      })
      .catch(err => {
        logger.error(`Something went wrong sending trade simulation result email. Err: ${err}`);
        res.json({ err });
        return next();
      });
  }

  function mockLeagueData() {
    return {
      leagueId: 49454731,
      settings: {
        name: 'the boyoys',
        regSeasonGames: 13,
        scoringType: 'replace',
        scoringFormat: [],
      },
      teams: [
        {
          id: 1,
          teamName: 'Buttery Crispy Flake',
          wins: 6,
          losses: 1,
          ties: 0,
          pointsFor: 753.12,
          pointsAgainst: 512.8,
          schedule: [2, 3, 4, 5, 6, 8, 9, 7, 10, 12, 11, 2, 3],
          scores: [],
          outcomes: [],
          roster: [
            {
              id: 4040715,
              name: 'Jalen Hurts',
              position: 'QB',
              rank: 1,
              proTeam: 'PHI',
              projectedAveragePoints: 21.5,
              projectedTotalPoints: 400,
              percentStarted: 99.9,
              stats: {},
            },
            {
              id: 2576414,
              name: 'Raheem Mostert',
              position: 'RB',
              rank: 2,
              proTeam: 'MIA',
              projectedAveragePoints: 13.9,
              projectedTotalPoints: 275,
              percentStarted: 98,
              stats: {},
            },
            {
              id: 3042519,
              name: 'Aaron Jones',
              position: 'RB',
              rank: 24,
              proTeam: 'GB',
              projectedAveragePoints: 12.1,
              projectedTotalPoints: 255,
              percentStarted: 92,
              stats: {},
            },
            {
              id: 4047646,
              name: 'AJ Brown',
              position: 'WR',
              rank: 3,
              proTeam: 'PHI',
              projectedAveragePoints: 15.6,
              projectedTotalPoints: 311,
              percentStarted: 99.9,
              stats: {},
            },
            {
              id: 4258173,
              name: 'Nico Collins',
              position: 'WR',
              rank: 14,
              proTeam: 'HOU',
              projectedAveragePoints: 14.9,
              projectedTotalPoints: 299,
              percentStarted: 97,
              stats: {},
            },
            {
              id: 4428331,
              name: 'Rashee Rice',
              position: 'WR',
              rank: 19,
              proTeam: 'KC',
              projectedAveragePoints: 13.1,
              projectedTotalPoints: 266,
              percentStarted: 92,
              stats: {},
            },
            {
              id: 4572680,
              name: 'Tucker Kraft',
              position: 'TE',
              rank: 11,
              proTeam: 'GB',
              projectedAveragePoints: 6.7,
              projectedTotalPoints: 111,
              percentStarted: 75,
              stats: {},
            },
            {
              id: 4362887,
              name: 'Justin Fields',
              position: 'QB',
              rank: 11,
              proTeam: 'CHI',
              projectedAveragePoints: 19,
              projectedTotalPoints: 366,
              percentStarted: 96,
              stats: {},
            },
            {
              id: 1010,
              name: '49ers D/ST',
              position: 'D/ST',
              rank: 5,
              proTeam: 'SF',
              projectedAveragePoints: 7.2,
              projectedTotalPoints: 125,
              percentStarted: 99.9,
              stats: {},
            },
            {
              id: 2971573,
              name: "Ka'imi Fairbairn",
              position: 'K',
              rank: 7,
              proTeam: 'HOU',
              projectedAveragePoints: 8.5,
              projectedTotalPoints: 137,
              percentStarted: 99.9,
              stats: {},
            },
            {
              id: 4569618,
              name: 'Garrett Wilson',
              position: 'WR',
              rank: 23,
              proTeam: 'NYJ',
              projectedAveragePoints: 12.6,
              projectedTotalPoints: 276,
              percentStarted: 85,
              stats: {},
            },
          ],
        },
        {
          id: 2,
          teamName: 'You Had All Summer',
          wins: 4,
          losses: 3,
          ties: 0,
          pointsFor: 711.42,
          pointsAgainst: 699.6,
          schedule: [1, 5, 3, 6, 4, 9, 7, 8, 10, 12, 3, 1, 11],
          scores: [],
          outcomes: [],
          roster: [
            {
              id: 4361741,
              name: 'Brock Purdy',
              position: 'QB',
              rank: 5,
              proTeam: 'SF',
              projectedAveragePoints: 20.5,
              projectedTotalPoints: 395,
              percentStarted: 99.9,
              stats: {},
            },
            {
              id: 4239996,
              name: 'Travis Etienne Jr.',
              position: 'RB',
              rank: 2,
              proTeam: 'JAX',
              projectedAveragePoints: 13.1,
              projectedTotalPoints: 265,
              percentStarted: 98,
              stats: {},
            },
            {
              id: 4427366,
              name: 'Breece Hall',
              position: 'RB',
              rank: 5,
              proTeam: 'NYJ',
              projectedAveragePoints: 13.4,
              projectedTotalPoints: 275,
              percentStarted: 94,
              stats: {},
            },
            {
              id: 2977187,
              name: 'Cooper Kupp',
              position: 'WR',
              rank: 11,
              proTeam: 'LAR',
              projectedAveragePoints: 14.6,
              projectedTotalPoints: 287,
              percentStarted: 99.9,
              stats: {},
            },
            {
              id: 4360438,
              name: 'Brandon Aiyuk',
              position: 'WR',
              rank: 12,
              proTeam: 'SF',
              projectedAveragePoints: 13.9,
              projectedTotalPoints: 277,
              percentStarted: 97,
              stats: {},
            },
            {
              id: 4429615,
              name: 'Zay Flowers',
              position: 'WR',
              rank: 27,
              proTeam: 'BAL',
              projectedAveragePoints: 11.1,
              projectedTotalPoints: 225,
              percentStarted: 92,
              stats: {},
            },
            {
              id: 15847,
              name: 'Travis Kelce',
              position: 'TE',
              rank: 1,
              proTeam: 'KC',
              projectedAveragePoints: 13.8,
              projectedTotalPoints: 212,
              percentStarted: 100,
              stats: {},
            },
            {
              id: 3915511,
              name: 'Joe Burrow',
              position: 'QB',
              rank: 6,
              proTeam: 'CIN',
              projectedAveragePoints: 20.6,
              projectedTotalPoints: 375,
              percentStarted: 99,
              stats: {},
            },
            {
              id: 2010,
              name: 'Jets D/ST',
              position: 'D/ST',
              rank: 2,
              proTeam: 'NYJ',
              projectedAveragePoints: 7.4,
              projectedTotalPoints: 135,
              percentStarted: 99.9,
              stats: {},
            },
            {
              id: 3953687,
              name: 'Brandon Aubrey',
              position: 'K',
              rank: 1,
              proTeam: 'DAL',
              projectedAveragePoints: 8.9,
              projectedTotalPoints: 147,
              percentStarted: 99.9,
              stats: {},
            },
            {
              id: 4040761,
              name: 'Devin Singletary',
              position: 'RB',
              rank: 23,
              proTeam: 'HOU',
              projectedAveragePoints: 10.6,
              projectedTotalPoints: 215,
              percentStarted: 85,
              stats: {},
            },
            {
              id: 4569987,
              name: 'Jaylen Warren',
              position: 'RB',
              rank: 25,
              proTeam: 'PIT',
              projectedAveragePoints: 9.3,
              projectedTotalPoints: 188,
              percentStarted: 81,
              stats: {},
            },
          ],
        },
        {
          id: 3,
          teamName: 'Team 3',
          wins: 1,
          losses: 6,
          ties: 0,
          pointsFor: 553.12,
          pointsAgainst: 552.8,
          schedule: [6, 1, 2, 4, 5, 7, 8, 9, 11, 10, 2, 12, 1],
          scores: [],
          outcomes: [],
          roster: [],
        },
        {
          id: 4,
          teamName: 'Team 4',
          wins: 3,
          losses: 4,
          ties: 0,
          pointsFor: 753.12,
          pointsAgainst: 512.8,
          schedule: [5, 6, 1, 3, 2, 12, 11, 10, 9, 8, 7, 5, 6],
          scores: [],
          outcomes: [],
          roster: [],
        },
        {
          id: 5,
          teamName: 'Team 5',
          wins: 4,
          losses: 3,
          ties: 0,
          pointsFor: 753.12,
          pointsAgainst: 512.8,
          schedule: [4, 2, 6, 1, 3, 10, 12, 11, 7, 9, 6, 4, 8],
          scores: [],
          outcomes: [],
          roster: [],
        },
        {
          id: 6,
          teamName: 'Team 6',
          wins: 3,
          losses: 4,
          ties: 0,
          pointsFor: 753.12,
          pointsAgainst: 512.8,
          schedule: [3, 4, 5, 2, 1, 11, 10, 12, 8, 7, 5, 9, 4],
          scores: [],
          outcomes: [],
          roster: [],
        },
        {
          id: 7,
          teamName: 'Team 7',
          wins: 7,
          losses: 0,
          ties: 0,
          pointsFor: 753.12,
          pointsAgainst: 512.8,
          schedule: [8, 9, 10, 11, 12, 3, 2, 1, 5, 6, 4, 8, 9],
          scores: [],
          outcomes: [],
          roster: [],
        },
        {
          id: 8,
          teamName: 'Team 8',
          wins: 2,
          losses: 5,
          ties: 0,
          pointsFor: 753.12,
          pointsAgainst: 512.8,
          schedule: [7, 11, 9, 12, 10, 1, 3, 2, 6, 4, 9, 7, 5],
          scores: [],
          outcomes: [],
          roster: [],
        },
        {
          id: 9,
          teamName: 'Team 9',
          wins: 5,
          losses: 2,
          ties: 0,
          pointsFor: 753.12,
          pointsAgainst: 512.8,
          schedule: [12, 7, 8, 10, 11, 2, 1, 3, 4, 5, 8, 6, 7],
          scores: [],
          outcomes: [],
          roster: [],
        },
        {
          id: 10,
          teamName: 'Team 10',
          wins: 3,
          losses: 4,
          ties: 0,
          pointsFor: 753.12,
          pointsAgainst: 512.8,
          schedule: [11, 12, 7, 9, 8, 5, 6, 4, 2, 3, 1, 11, 12],
          scores: [],
          outcomes: [],
          roster: [],
        },
        {
          id: 11,
          teamName: 'Team 11',
          wins: 0,
          losses: 7,
          ties: 0,
          pointsFor: 753.12,
          pointsAgainst: 512.8,
          schedule: [10, 8, 12, 7, 9, 6, 4, 5, 3, 1, 12, 10, 2],
          scores: [],
          outcomes: [],
          roster: [],
        },
        {
          id: 12,
          teamName: 'Team 12',
          wins: 4,
          losses: 3,
          ties: 0,
          pointsFor: 753.12,
          pointsAgainst: 512.8,
          schedule: [9, 10, 11, 8, 7, 4, 5, 6, 1, 2, 11, 3, 10],
          scores: [],
          outcomes: [],
          roster: [],
        },
      ],
    };
  }

  return { getLeague, simulateLeague, getUserLeagues, saveNewUserLeague, simulateTrade, shareTradeSimulationResults };
};
