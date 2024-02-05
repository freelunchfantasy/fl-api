import constants from '../lib/constants.js';
import { ForbiddenAccessError } from '../lib/errors.js';
import jwt from 'jwt-simple';

export default (config, logger, key) => {
  function checkToken(req, res, next) {
    try {
      const token = req.cookies[config.cookieTokenAttribute];
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
