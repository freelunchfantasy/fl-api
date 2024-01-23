import EntitiesDbo from '../../db/sql-clients/entities-dbo.js';
import DataProcessingHelper from '../../helpers/data-processing-helper.js';
import WordComparisonHelper from '../../helpers/word-comparison-helper.js';

// Local instances
const dbo = new EntitiesDbo();
const dataProcessingHelper = new DataProcessingHelper();
const wordComparisonHelper = new WordComparisonHelper();
const MAX_GUESSES = 6;

/**
 * Method for getting today's target word id
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export async function getTodaysTargetWordId(req, res, next) {
  const { today } = req.body;
  console.log(`Received request to get todays target word id for date: ${today}`);
  if (!today) {
    console.log(`Bad request to get todays target word id for date: ${today}`);
    res.status(400);
    res.json({ message: `Attempted to get todays target word id but a parameter was missing` });
    return next();
  }
  dbo
    .fetchTodaysTargetWordId(today)
    .then(targetWordId => {
      const successMessage = `Successfully retrieved today's target word id for date: ${today}`;
      console.log(successMessage);
      res.json(targetWordId);
      return next();
    })
    .catch(err => {
      const errorMessage = `Something went wrong getting today's target word id for date: ${today}. Error: ${err}`;
      console.log(errorMessage);
      res.sendStatus(500);
      res.json({ message: errorMessage });
      return next();
    });
}

/**
 * Method for getting a user's guesses for input date
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export async function getUserGuesses(req, res, next) {
  const { userId, date } = req.body;
  console.log(`Received request to get user guesses for user id: ${userId}, date: ${date}`);
  if (!userId || !date) {
    console.log(`Bad request to get user guesses with user id: ${userId}, date: ${date}`);
    res.status(400);
    res.json({ message: `Attempted to get user guesses but a parameter was missing` });
    return next();
  }
  dbo
    .fetchUserGuesses(userId, date)
    .then(userGuesses => {
      const successMessage = `Successfully retrieved user guesses for user id: ${userId}, date: ${date}`;
      console.log(successMessage);
      res.json(dataProcessingHelper.processesUserGuesses(userGuesses));
      return next();
    })
    .catch(err => {
      const errorMessage = `Something went wrong getting user guesses for user id: ${userId}, date: ${date}. Error: ${err}`;
      console.log(errorMessage);
      res.sendStatus(500);
      res.json({ message: errorMessage });
      return next();
    });
}

/**
 * Method for comparing input word to target word
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export async function guessWord(req, res, next) {
  console.log(`Received request to guess if word is target word`);
  const { word, targetWordId, userId, currentGuessNumber, prevMatchingLetters } = req.body;
  if (!word || !targetWordId || !userId || !currentGuessNumber) {
    console.log(
      `Bad request to guess if word is target word with word: ${word}, target word id: ${targetWordId}, userId: ${userId}, guessNumber: ${currentGuessNumber}`
    );
    res.status(400);
    res.json({
      message: `Attempted to guess if word is target word without properly specifying oen of the word, target word id, user id, or guess number`,
    });
    return next();
  }
  dbo
    .fetchTargetWordById(targetWordId)
    .then(targetWord => {
      console.log(`Successfully retrieved target word with id ${targetWordId}`);
      wordComparisonHelper
        .compareWordToTargetWord(
          word,
          dataProcessingHelper.processTargetWords(targetWord)[0],
          currentGuessNumber,
          prevMatchingLetters
        )
        .then(comparison => {
          console.log(`Successfully compared ${word} to today's target word for user id ${userId}`);
          dbo
            .insertGuess(word, targetWordId, userId, comparison)
            .then(result => {
              console.log(
                `Successfully inserted guess of word ${word} for target word id:${targetWordId} for user id ${userId}, guessNumber: ${currentGuessNumber}`
              );
              handleIfGameEnd(userId, comparison, currentGuessNumber);
              res.json(comparison);
              return next();
            })
            .catch(err => {
              const errorMessage = `Something went wrong inserting guess of word ${word} for target word id ${targetWordId} for user id ${userId}, guessNumber: ${currentGuessNumber}. Error: ${err}`;
              console.log(errorMessage);
              res.sendStatus(500);
              res.json({ message: errorMessage });
              return next();
            });
        })
        .catch(err => {
          const errorMessage = `Could not compare ${word} to target word with id ${targetWordId}. Likely an invalid word entered`;
          console.log(errorMessage);
          res.sendStatus(500);
          res.json({ message: errorMessage });
          return next();
        });
    })
    .catch(err => {
      const errorMessage = `Something went wrong retrieving target word with id ${targetWordId} for user id ${userId}. Error: ${err}`;
      console.log(errorMessage);
      res.sendStatus(500);
      res.json({ message: errorMessage });
      return next();
    });
}

/**
 * Method for getting game end info for input user id and target word id
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export async function getGameEndInfo(req, res, next) {
  console.log(`Received request to get game end info`);
  const { userId, targetWordId } = req.body;
  if (!userId || !targetWordId) {
    console.log(`Bad request to get game end info with userId ${userId} and targetWordId ${targetWordId}`);
    res.status(400);
    res.json({
      message: `Attempted to get game end info but a parameterr was missing`,
    });
    return next();
  }
  dbo
    .fetchGameEndInfo(userId, targetWordId)
    .then(gameEndInfo => {
      console.log(`Successfully got game end info with userId ${userId} and targetWordId ${targetWordId}`);
      res.json(dataProcessingHelper.processGameEndInfo(gameEndInfo));
      return next();
    })
    .catch(err => {
      const errorMessage = `Could not get game end info with userId ${userId} and targetWordId ${targetWordId}. Error: ${err}`;
      console.log(errorMessage);
      res.sendStatus(500);
      res.json({ message: errorMessage });
      return next();
    });
}

/**
 * Helper function for handling if a submitted guess resulted in the game ending in a win or a loss
 */
function handleIfGameEnd(userId, comparison, currentGuessNumber) {
  const correctGuess = comparison => comparison.comparison.sameWord;
  if (correctGuess(comparison)) {
    dbo.increaseUserStreak(userId);
  }

  const gameOver = currentGuessNumber >= MAX_GUESSES;
  if (gameOver) {
    dbo.resetUserStreak(userId);
  }
}
