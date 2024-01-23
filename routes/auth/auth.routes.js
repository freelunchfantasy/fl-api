import EntitiesDbo from '../../db/sql-clients/entities-dbo.js';
import DataProcessingHelper from '../../helpers/data-processing-helper.js';

// Local instances
const dbo = new EntitiesDbo();
const dataProcessingHelper = new DataProcessingHelper();

/**
 * Method for getting a game user from the database
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export async function getGameUser(req, res, next) {
  console.log(`Received request to get game user`);
  const { authUserId, email } = req.body;
  if (!authUserId || !email) {
    console.log(`Bad request to get game user`);
    res.status(400);
    res.json({
      message: `Attempted to get game user with auth user id: ${authUserId}, email: ${email} but a parameter was missing`,
    });
    return next();
  }
  dbo
    .fetchGameUser(authUserId)
    .then(gameUser => {
      createGameUserIfNeeded(gameUser.recordset, authUserId, email)
        .then(user => {
          console.log(`Successfully retrieved game user for ${email}. Game user id is ${user.id}`);
          res.json(user);
          return next();
        })
        .catch(err => {
          const errorMessage = `Something went wrong creating game user. Error: ${err}`;
          console.log(errorMessage);
          res.sendStatus(500);
          res.json({ message: errorMessage });
          return next();
        });
    })
    .catch(err => {
      const errorMessage = `Something went wrong retrieving game user. Error: ${err}`;
      console.log(errorMessage);
      res.sendStatus(500);
      res.json({ message: errorMessage });
      return next();
    });
}

async function createGameUserIfNeeded(gameUser, authUserId, email) {
  return new Promise((resolve, reject) => {
    if (gameUser.length > 0) return resolve(gameUser[0]);
    console.log(`No game user found, creating a new one`);
    dbo
      .insertGameUser(authUserId, email)
      .then(gameUser => {
        console.log(`Successfully created new game user for email ${email}. New game user id is ${gameUser.id}`);
        resolve(gameUser);
      })
      .catch(err => {
        reject(err);
      });
  });
}
