import EntitiesDbo from '../db/sql-clients/entities-dbo.js';

export default logger => {
  const dbo = new EntitiesDbo();

  function updateLastActivity(req, res, next) {
    if (!(req.user && req.user.id)) return next();
    dbo
      .updateUserLastActivity(req.user.id)
      .then(result => {
        logger.info(`Successfully updated last activity for user ${req.user.id}`);
        next();
      })
      .catch(err => {
        logger.info(`Something went wrong updating last activity for user ${req.user.id}`);
        next();
      });
  }

  return updateLastActivity;
};
