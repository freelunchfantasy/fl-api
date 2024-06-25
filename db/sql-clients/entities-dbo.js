import sql from 'mssql';
import logger from 'winston';
import { configDotenv } from 'dotenv';
import QueryHelper from '../../helpers/query-helper.js';

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
  }

  getUserLeagues(userId) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.getUserLeaguesQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset);
        });
      });
    });
  }

  checkUserLeague(userId, externalLeagueId, leagueSourceId) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.getCheckUserLeagueQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('externalLeagueId', sql.Int, externalLeagueId);
        request.input('leagueSourceId', sql.Int, leagueSourceId);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset);
        });
      });
    });
  }

  saveNewUserLeague(
    userId,
    externalLeagueId,
    leagueName,
    userTeamId,
    userTeamName,
    userTeamRank,
    totalTeams,
    leagueSourceId
  ) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.insertNewUserLeagueQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('externalLeagueId', sql.Int, externalLeagueId);
        request.input('leagueName', sql.VarChar, leagueName);
        request.input('userTeamId', sql.Int, userTeamId);
        request.input('userTeamName', sql.VarChar, userTeamName);
        request.input('userTeamRank', sql.Int, userTeamRank);
        request.input('totalTeams', sql.Int, totalTeams);
        request.input('leagueSourceId', sql.Int, leagueSourceId);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset[0]);
        });
      });
    });
  }

  deleteUserLeague(userLeagueId) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.deleteUserLeagueQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userLeagueId', sql.Int, userLeagueId);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset);
        });
      });
    });
  }

  updateUserLeague(userLeagueId, leagueName, userTeamId, userTeamName, userTeamRank) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.updateUserLeagueQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userLeagueId', sql.Int, userLeagueId);
        request.input('leagueName', sql.VarChar, leagueName);
        request.input('userTeamId', sql.Int, userTeamId);
        request.input('userTeamName', sql.VarChar, userTeamName);
        request.input('userTeamRank', sql.Int, userTeamRank);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset);
        });
      });
    });
  }

  getNflTeams() {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.getNflTeamsQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset);
        });
      });
    });
  }

  getLeagueSources() {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.getLeagueSourcesQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset);
        });
      });
    });
  }

  insertUser(email, password, firstName, lastName) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.insertUserQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        const now = new Date().toISOString();
        var request = new sql.Request();
        request.input('firstName', sql.VarChar, firstName);
        request.input('lastName', sql.VarChar, lastName);
        request.input('email', sql.VarChar, email);
        request.input('password', sql.VarChar, password);
        request.input('dateJoined', sql.VarChar, now);
        request.input('lastActivity', sql.VarChar, now);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset[0]);
        });
      });
    });
  }

  getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.getUserByEmailQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('email', sql.VarChar, email);
        request.query(query, (err, recordset) => {
          if (err) {
            logger.info(`Unexpected error while checking if user already exists: ${err}`);
            reject(new Error('Server error occurred during register'));
          }
          resolve(recordset.recordset[0]);
        });
      });
    });
  }

  getUserByEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.getUserByEmailAndPasswordQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('email', sql.VarChar, email);
        request.input('password', sql.VarChar, password);
        request.query(query, (err, recordset) => {
          if (err) {
            logger.info(`Unexpected error during u+p login: ${err}`);
            reject(new Error('Server error occurred during login'));
          }
          if (recordset.recordset.length == 0) reject(new Error('Invalid credentials'));
          resolve(recordset.recordset[0]);
        });
      });
    });
  }

  getUserPasswordByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.getUserPasswordByEmailQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('email', sql.VarChar, email);
        request.query(query, (err, recordset) => {
          if (err) {
            logger.info(`Unexpected error during u+p login: ${err}`);
            reject(new Error('Server error occurred during login'));
          }
          if (recordset.recordset.length == 0) reject(new Error('Invalid credentials'));
          resolve(recordset.recordset[0]);
        });
      });
    });
  }

  getUserById(id) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.getUserByIdQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('id', sql.Int, id);
        request.query(query, (err, recordset) => {
          if (err) {
            logger.info(`Unexpected error during u+p login: ${err}`);
            reject(new Error('Server error occurred during login'));
          }
          if (recordset.recordset.length == 0) reject(new Error('Could not find user id encoded in jwt'));
          resolve(recordset.recordset[0]);
        });
      });
    });
  }

  updateUserLastActivity(id) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.updateUserLastActivityQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        const now = new Date();
        var request = new sql.Request();
        request.input('id', sql.Int, id);
        request.input('lastActivity', sql.VarChar, now.toISOString());
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset);
        });
      });
    });
  }

  assignDemoLeague(userId, userTeamId, userTeamName, userTeamRank, totalTeams) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.assignDemoLeagueQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('userTeamId', sql.Int, userTeamId);
        request.input('userTeamName', sql.VarChar, userTeamName);
        request.input('userTeamRank', sql.Int, userTeamRank);
        request.input('totalTeams', sql.Int, totalTeams);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset);
        });
      });
    });
  }

  insertTradeSimulation(userId) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.insertTradeSimulationQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        const now = new Date();
        var request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('dateSimulated', sql.VarChar, now.toISOString());
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset);
        });
      });
    });
  }

  getUserAndLeagueNames(userId, userLeagueId) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.getUserAndLeagueNamesQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userLeagueId', sql.Int, userLeagueId);
        request.input('userId', sql.Int, userId);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset[0]);
        });
      });
    });
  }

  insertTradeSimulationShare(userId, userLeagueId, targetEmail) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.insertTradeSimulationShareQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        const now = new Date();
        var request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('userLeagueId', sql.Int, userLeagueId);
        request.input('targetEmail', sql.VarChar, targetEmail);
        request.input('dateShared', sql.VarChar, now.toISOString());
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset[0]);
        });
      });
    });
  }

  syncUserLeagueData(userId, externalLeagueId, leagueSourceId, userTeamName, userTeamRank, totalTeams) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.syncUserLeagueDataQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('externalLeagueId', sql.Int, externalLeagueId);
        request.input('leagueSourceId', sql.Int, leagueSourceId);
        request.input('userTeamName', sql.VarChar, userTeamName);
        request.input('userTeamRank', sql.Int, userTeamRank);
        request.input('totalTeams', sql.Int, totalTeams);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset);
        });
      });
    });
  }
}
