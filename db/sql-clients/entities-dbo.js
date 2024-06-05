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

  saveNewUserLeague(userId, externalLeagueId, leagueName, userTeamId) {
    return new Promise((resolve, reject) => {
      const query = this.queryHelper.insertNewUserLeagueQuery();
      sql.connect(this.config, err => {
        if (err) reject(err);
        var request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('externalLeagueId', sql.Int, externalLeagueId);
        request.input('leagueName', sql.VarChar, leagueName);
        request.input('userTeamId', sql.Int, userTeamId);
        request.query(query, (err, recordset) => {
          if (err) reject(err);
          resolve(recordset.recordset[0]);
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
}
