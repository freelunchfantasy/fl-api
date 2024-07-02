import constants from '../lib/constants.js';
import { ForbiddenAccessError } from '../lib/errors.js';
import jwt from 'jwt-simple';
import logger from 'winston';

export default (config, logger, key) => {
  function checkToken(req, res, next) {
    try {
      logger.info(`KEY: ${key}`);
      const token = req.cookies[config.cookieTokenAttribute];
      logger.info(`TOKEN: ${token}`);
      processToken(token);
    } catch (err) {
      req.errType = constants.errorTypes.UNAUTHORIZED;
      next(new ForbiddenAccessError());
    }

    function processToken(token) {
      if (!token) throw new Error();
      const decoded = jwt.decode(token, key);
      req['user'] = {
        id: decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      };
      next();
    }
  }

  return checkToken;
};
