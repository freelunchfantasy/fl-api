import jwt from 'jwt-simple';
import logger from 'winston';
import bcrypt from 'bcrypt';
import { configDotenv } from 'dotenv';
import EntitiesDbo from '../db/sql-clients/entities-dbo.js';
import DataProcessingHelper from '../helpers/data-processing-helper.js';
import DemoLeagueHelper from '../helpers/demo-league-helper.js';
import LeagueDataHelper from '../helpers/league-data-helper.js';
import SendgridHelper from '../helpers/sendgrid-helper.js';

// Local instances
const dbo = new EntitiesDbo();
const dataProcessingHelper = new DataProcessingHelper();
const demoLeagueHelper = new DemoLeagueHelper();
const leagueDataHelper = new LeagueDataHelper();
const sendgridHelper = new SendgridHelper();
configDotenv();
const key = process.env.JWT_PUBLIC_KEY;
const saltRounds = 10;

/**
 * Method for logging a user in
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export async function login(req, res, next) {
  const { e, p, sessionToken } = req.body;
  if (e && p) {
    logger.info(`Received login attempt with email ${e} and password ${p}`);
    dbo.getUserPasswordByEmail(e).then(result => {
      const hashed = result.password;
      bcrypt.compare(p, hashed, (err, passwordsMatch) => {
        if (passwordsMatch) {
          dbo
            .getUserByEmailAndPassword(e, hashed)
            .then(u => {
              const user = dataProcessingHelper.processUser(u);
              user.sessionToken = encodeSessionJwt(user);
              logger.info(`Successfully logged in user ${user.id}`);
              req['user'] = { id: user.id };
              res.json({ user: user, success: true });
              return next();
            })
            .catch(err => {
              logger.info(`Could not log user in - ${err}`);
              res.json({ error: `${err}`, success: false });
              return next();
            });
        } else {
          const msg = 'Invalid credentials';
          logger.info(msg);
          res.json({ error: `${msg}`, success: false });
          return next();
        }
      });
    });
  } else {
    const decoded = jwt.decode(sessionToken, key);
    const id = decoded.id;
    logger.info(`Received login attempt with id ${id} in jwt`);
    dbo
      .getUserById(id)
      .then(foundUser => {
        const user = dataProcessingHelper.processUser(foundUser);
        user.sessionToken = encodeSessionJwt(user);
        logger.info(`Successfully logged in user ${user.id}`);
        req['user'] = { id: user.id };
        res.json({ user: user, success: true });
        return next();
      })
      .catch(err => {
        logger.info(`Could not log user in - ${err}`);
        res.json({ error: `${err}`, success: false });
        return next();
      });
  }
}

export async function register(req, res, next) {
  const { e, p, firstName, lastName } = req.body;
  logger.info(`Received register request with email ${e}, firstName ${firstName}, lastName ${lastName}`);

  dbo.getUserByEmail(e).then(result => {
    if (result) {
      logger.info(`Cannot register new user, email already exists`);
      res.json({ error: 'Email address already registered' });
      return next();
    }
    bcrypt.hash(p, saltRounds, (err, hash) => {
      if (err) {
        logger.error(`Something went wrong hashing user password`);
        return next();
      }
      dbo
        .insertUser(e, hash, firstName, lastName)
        .then(result => {
          logger.info(`Successfully registered user ${result.id}`);
          const demoLeagueData = demoLeagueHelper.getDemoLeagueData();
          const totalTeams = demoLeagueData.teams.length;
          const randomUserTeamId = () => Math.floor(Math.random() * totalTeams + 1);
          const userTeamId = randomUserTeamId();
          const userTeamName = demoLeagueData.teams.find(t => t.id == userTeamId).teamName;
          const userTeamRank = leagueDataHelper.determineTeamRank(demoLeagueData.teams, userTeamId);
          dbo.assignDemoLeague(result.id, userTeamId, userTeamName, userTeamRank, totalTeams).then(() => {
            const sessionToken = encodeSessionJwt({ id: result.id, email: e, firstName, lastName });
            res.json({
              user: {
                id: result.id,
                firstName,
                lastName,
                e,
                sessionToken,
              },
              success: true,
            });
            return next();
          });
        })
        .catch(err => {
          const errorMessage = `Something went wrong registering new user. Error: ${err}`;
          logger.info(errorMessage);
          res.sendStatus(500);
          res.json({ message: errorMessage });
          return next();
        });
    });
  });
}

export async function sendContactEmail(req, res, next) {
  try {
    const now = new Date();
    const inputs = {
      sender_email: req.body.e,
      sender_name: `${req.body.firstName} ${req.body.lastName}`,
      message: req.body.message,
      date_submitted: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
    };
    sendgridHelper.sendFeedbackMessageEmail(inputs);
    logger.info(`Successfully sent feedback message email from ${req.body.e}`);
    res.json({});
    next();
  } catch (err) {
    logger.error(`Something went wrong sending feedback message email. Err: ${err}`);
    res.json({ err });
    return next();
  }
}

function encodeSessionJwt(user) {
  return jwt.encode(
    {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    key
  );
}
