import sql from 'mssql';
import { configDotenv } from 'dotenv';
import QueryHelper from '../../helpers/query-helper.js';
import WordInfoHelper from '../../helpers/word-info-helper.js';

export default class EntitiesDbo {
  static instance_;

  constructor() {
    if (this.instance_) return this.instance_; // return instance if already declared
    configDotenv();
    this.instance_ = this;
    this.config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      server: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
    };
    this.queryHelper = new QueryHelper();
    this.WordInfoHelper = new WordInfoHelper();
  }

  /**
   * Inserts a new game user into the database with input auth user id and email
   * @param {*} authUserId - auth user id of game user to insert
   * @param {*} email - email of game user to insert
   * @returns
   */
  insertGameUser(authUserId, email) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.insertGameUserQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        const now = new Date().toISOString();
        var request = new sql.Request();
        request.input('authUserId', sql.VarChar, authUserId);
        request.input('email', sql.VarChar, email);
        request.input('dateJoined', sql.VarChar, now);
        request.input('lastLogin', sql.VarChar, now);
        request.input('currentStreak', sql.Int, 0);
        request.input('longestStreak', sql.Int, 0);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset[0]);
        });
      });
    });
  }

  /**
   * Fetches a game user from the database by their auth user id
   * @param {*} authUserId - auth user id of the game user to fetch
   * @returns
   */
  fetchGameUser(authUserId) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.selectGameUserQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('authUserId', sql.VarChar, authUserId);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset);
        });
      });
    });
  }

  /**
   * Fetches all target words from the database
   * @returns an array containing target words
   */
  fetchTargetWords() {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.selectTargetWordsQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        console.log(`Fetching all target word with query: ${query}`);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset);
        });
      });
    });
  }

  /**
   * Inserts a target word into the database
   * @param {*} word - target word to be inserted
   * @returns
   */
  insertTargetWord(word, targetDate, numLetters, numSyllables, firstUsed, definition) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.insertTargetWordQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('word', sql.VarChar, word.toLowerCase());
        request.input('numLetters', sql.Int, numLetters);
        request.input('numSyllables', sql.Int, numSyllables);
        request.input('firstUsed', sql.Int, firstUsed);
        request.input('definition', sql.VarChar, definition);
        request.input('targetDate', sql.VarChar, targetDate);
        console.log(
          `Inserting target word into database with query: ${query} and params: ${[
            word,
            numLetters,
            numSyllables,
            firstUsed,
            definition,
            targetDate,
          ]}`
        );
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset);
        });
      });
    });
  }

  /**
   * Deletes a target word from the database
   * @param {*} id - id of the target word to be deleted
   */
  deleteTargetWord(id) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.deleteTargetWordQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('id', sql.Int, id);
        console.log(`Deleting target word from database with query: ${query} and params ${id}`);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset);
        });
      });
    });
  }

  /**
   * Fetches stats of a target word from the database
   * @param {*} id - id of the target word to fetch stats for
   * @returns
   */
  fetchTargetWordStats(id) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.selectTargetWordStatsQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('id', sql.Int, id);
        console.log(`Fetching stats for target word with query: ${query} and params: ${id}`);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset[0]);
        });
      });
    });
  }

  /**
   * Updates target word stats for the input target word id
   * @param {*} id - id of the target word to update stats for
   * @returns
   */
  updateTargetWordStats(id, numGuesses, numUsers) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.updateTargetWordStatsQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('numGuesses', sql.Int, numGuesses);
        request.input('numUsers', sql.Int, numUsers);
        request.input('id', sql.Int, id);
        console.log(
          `Updating target word stats stats for target word with query: ${query} and params: ${
            (numUsers, numGuesses, id)
          }`
        );
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset);
        });
      });
    });
  }

  /**
   * Deletes target word guesses for the input target word id
   * @param {*} id - id of the target word to delete guesses for
   * @returns
   */
  deleteTargetWordGuesses(id) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.deleteUserGuessesQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('targetWordId', sql.Int, id);
        console.log(`Deleting user guesses for target word with query: ${query} and params: ${id}`);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          const query2 = this.queryHelper.deleteGuessesQuery();
          const guessIds = recordset.recordset.map(row => row.guess_id);
          guessIds.forEach(guessId => {
            var req = new sql.Request();
            req.input('guessId', sql.Int, guessId);
            console.log(`Deleting guess with query: ${query2} and params: ${guessId}`);
            req.query(query2);
          });
          resolve();
        });
      });
    });
  }

  /**
   * Fetches the target word according to input id
   * @param {*} id - id of target word to fetch
   */
  fetchTargetWordById(id) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.selectTargetWordByIdQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('id', sql.Int, id);
        console.log(`Fetching target word with query: ${query} and params: ${id}`);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset);
        });
      });
    });
  }

  /**
   * Fetches todays target word id from the db
   * @param {*} date - todays date
   * @returns
   */
  fetchTodaysTargetWordId(date) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.selectTodaysTargetWordIdQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('date', sql.VarChar, date);
        console.log(`Fetching todays target word id with query: ${query} and params: ${date}`);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset[0].id);
        });
      });
    });
  }

  /**
   * Fetches user guesses for input user id and date
   * @param {*} userId
   * @param {*} targetWordId
   * @returns
   */
  fetchUserGuesses(userId, date) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.selectUserGuessesQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('date', sql.VarChar, date);
        console.log(`Fetching user guesses with query: ${query} and params: ${(userId, date)}`);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset);
        });
      });
    });
  }

  /**
   * Inserts a guess (and corresponding user_guess) into the database
   * @param {*} word
   * @param {*} targetWordId
   * @param {*} userId
   * @param {*} comparison
   * @returns
   */
  insertGuess(word, targetWordId, userId, comparison) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.insertGuessQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        const now = new Date().toISOString();
        const comparisonString = JSON.stringify(comparison);
        request.input('word', sql.VarChar, word);
        request.input('result', sql.VarChar, JSON.stringify(comparisonString));
        request.input('timeGuessed', sql.VarChar, now);
        console.log(`Inserting guess with query: ${query} and params: ${[word, comparisonString, now]}`);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          const guessId = recordset.recordset[0].id;
          const query2 = this.queryHelper.InsertUserGuessQuery();
          var request2 = new sql.Request();
          request2.input('userId', sql.Int, userId);
          request2.input('guessId', sql.Int, guessId);
          request2.input('targetWordId', sql.Int, targetWordId);
          console.log(`Inserting user guess with query: ${query} and params: ${[userId, guessId, targetWordId]}`);
          request2.query(query2, (err, recordset) => {
            if (err) reject(err);
            resolve(recordset);
          });
        });
      });
    });
  }

  /**
   * Updates a user's current streak and longest streak in the database
   * @param {*} userId
   * @returns
   */
  increaseUserStreak(userId) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.increaseUserCurrentStreakQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          const query2 = this.queryHelper.updateUserLongestStreakQuery();
          var request2 = new sql.Request();
          request2.input('userId', sql.Int, userId);
          request2.query(query2, (err, recordset) => {
            if (err) reject(err);
            resolve();
          });
        });
      });
    });
  }

  /**
   * Resets a user's current streak in the database
   * @param {*} userId
   */
  resetUserStreak(userId) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.resetUserCurrentStreakQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  }

  /**
   * Fetches game end info for input game user id and target word id from database
   * @param {*} gameUserId
   * @param {*} targetWordId
   * @returns
   */
  fetchGameEndInfo(gameUserId, targetWordId) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.selectGameEndInfoQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('gameUserId', sql.Int, gameUserId);
        request.input('targetWordId', sql.Int, targetWordId);
        console.log(`Selecting game end info with query: ${query} and params: ${[gameUserId, targetWordId]}`);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset);
        });
      });
    });
  }
}
