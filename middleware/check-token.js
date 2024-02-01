import constants from '../lib/constants.js';
import { ForbiddenAccessError } from '../lib/errors.js';

export default (config, logger) => {
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
      // TO-DO: Check valid token
      next();
    }
  }

  return checkToken;
};
