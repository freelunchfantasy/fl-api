import EntitiesDbo from '../../db/sql-clients/entities-dbo.js';
import DataProcessingHelper from '../../helpers/data-processing-helper.js';
import WordInfoHelper from '../../helpers/word-info-helper.js';

// Local instances
const dbo = new EntitiesDbo();
const dataProcessingHelper = new DataProcessingHelper();
const wordInfoHelper = new WordInfoHelper();

/**
 * Method for getting all target words from the database
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export async function getTargetWords(req, res, next) {
  console.log(`Received request to get all target words`);
  dbo
    .fetchTargetWords()
    .then(targetWords => {
      console.log(`Successfully retrieved target words`);
      res.json(dataProcessingHelper.processTargetWords(targetWords));
      return next();
    })
    .catch(err => {
      const errorMessage = `Something went wrong retrieving target words. Error: ${err}`;
      console.log(errorMessage);
      res.sendStatus(500);
      res.json({ message: errorMessage });
      return next();
    });
}

/**
 * Method for checking the info of a potential new target word
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export async function checkTargetWord(req, res, next) {
  const { word } = req.body;
  console.log(`Received request to check target word: ${word}`);
  if (!word) {
    console.log(`Bad request to check target word with word: ${word}`);
    res.status(400);
    res.json({ message: `Attempted to check target word without properly specifying the word` });
    return next();
  }
  wordInfoHelper
    .getWordInfo(word)
    .then(info => {
      console.log(`Successfully retrieved word info for word to check`);
      res.json(dataProcessingHelper.processWordInfo(info));
      return next();
    })
    .catch(err => {
      const errorMessage = `Something went wrong checking target word. Error: ${err}`;
      console.log(errorMessage);
      res.sendStatus(500);
      res.json({ message: errorMessage });
      return next();
    });
}

/**
 * Method for adding a new target word into the database
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export async function createTargetWord(req, res, next) {
  const { word, targetDate, numLetters, numSyllables, firstUsed, definition } = req.body;
  console.log(`Received request to create target word: ${word}, target date: ${targetDate}`);
  if (!word || !targetDate || !numLetters || !numSyllables || !firstUsed || !definition) {
    console.log(`Bad request to create target word. Missing parameter`);
    res.status(400);
    res.json({ message: `Attempted to create target word but a required parameter was missing` });
    return next();
  }
  dbo
    .insertTargetWord(word, targetDate, numLetters, numSyllables, firstUsed, definition)
    .then(insertResult => {
      const successMessage = `Successfully created target word: ${word}, target date: ${targetDate}`;
      console.log(successMessage);
      res.json({ message: successMessage });
      return next();
    })
    .catch(err => {
      const errorMessage = `Something went wrong creating target word: ${word}, target date: ${targetDate}. Error: ${err}`;
      console.log(errorMessage);
      res.sendStatus(500);
      res.json({ message: errorMessage });
      return next();
    });
}

/**
 * Method for deleting a target word from the database
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export async function deleteTargetWord(req, res, next) {
  const id = parseInt(req.params.id);
  console.log(`Received request to delete target word id: ${id}`);
  if (!id) {
    console.log(`Bad request to delete target word id: ${id}`);
    res.status(400);
    res.json({ message: `Attempted to delete target word id: ${id} but a parameter was missing` });
    return next();
  }
  dbo
    .deleteTargetWord(id)
    .then(deleteResult => {
      const successMessage = `Successfully deleted target word id: ${id}`;
      console.log(successMessage);
      res.json({ message: successMessage });
      return next();
    })
    .catch(err => {
      const errorMessage = `Something went wrong deleting target word id: ${id}. Error: ${err}`;
      console.log(errorMessage);
      res.sendStatus(500);
      res.json({ message: errorMessage });
      return next();
    });
}

/**
 * Method for getting stats of a target word from the database (the current word of the day)
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export async function getTargetWordStats(req, res, next) {
  const targetWordId = parseInt(req.params.id);
  console.log(`Received request to get stats for target word ID: ${targetWordId}`);
  if (!targetWordId) {
    console.log(`Bad request to get target word stats with id: ${targetWordId}`);
    res.status(400);
    res.json({ message: `Attempted to get target word stats but a parameter was missing` });
    return next();
  }
  dbo
    .fetchTargetWordStats(targetWordId)
    .then(stats => {
      const successMessage = `Successfully retrieved target word stats for target word id: ${targetWordId}`;
      console.log(successMessage);
      res.json(dataProcessingHelper.processTargetWordStats(stats));
      return next();
    })
    .catch(err => {
      const errorMessage = `Something went wrong getting target word stats for target word id: ${targetWordId}`;
      console.log(errorMessage);
      res.sendStatus(500);
      res.json({ message: errorMessage });
      return next();
    });
}

export async function resolveTargetWordStats(req, res, next) {
  const { targetWordId } = req.body;
  console.log(`Received request to resolve target word stats for target word id: ${targetWordId}`);
  if (!targetWordId) {
    console.log(`Bad request to resolve target word stats with id: ${targetWordId}`);
    res.status(400);
    res.json({ message: `Attempted to resolve target word stats but a parameter was missing` });
    return next();
  }
  dbo
    .fetchTargetWordStats(targetWordId)
    .then(resolveResult => {
      console.log(`Successfully fetching target word stats while resolving stats for target word id: ${targetWordId}`);
      dbo
        .updateTargetWordStats(targetWordId, resolveResult.num_guesses, resolveResult.num_users)
        .then(insertResult => {
          console.log(`Successfully updated stats for target word id: ${targetWordId}`);
          dbo
            .deleteTargetWordGuesses(targetWordId)
            .then(deleteResult => {
              const successMessage = `Successfully resolved stats for target word id: ${targetWordId}`;
              console.log(successMessage);
              res.json({ message: successMessage });
              return next();
            })
            .catch(err => {
              const errorMessage = `Something went wrong deleting guesses while resolving stats for target word id: ${targetWordId}. Error: ${err}`;
              console.log(errorMessage);
              res.sendStatus(500);
              res.json({ message: errorMessage });
              return next();
            });
        })
        .catch(err => {
          const errorMessage = `Something went wrong updating target word stats while resolving stats for target word id: ${targetWordId}. Error: ${err}`;
          console.log(errorMessage);
          res.sendStatus(500);
          res.json({ message: errorMessage });
          return next();
        });
    })
    .catch(err => {
      const errorMessage = `Something went wrong fetching target word stats while resolving stats for target word id: ${targetWordId}. Error: ${err}`;
      console.log(errorMessage);
      res.sendStatus(500);
      res.json({ message: errorMessage });
      return next();
    });
}
