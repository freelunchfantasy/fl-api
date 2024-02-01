import { v4 as uuidv4 } from 'uuid';

/**
 * Method for getting ESPN league by ID
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export async function login(req, res, next) {
  const { e, p, sessionToken } = req.body;
  if (sessionToken) {
    console.log(`Received login attempt with session token ${sessionToken}`);
  } else {
    console.log(`Received login attempt with email ${e} and password ${p}`);
  }

  setTimeout(() => {
    res.json({ sessionToken: uuidv4() });
    next();
  }, 1000);
}

export async function register(req, res, next) {
  const { e, p, firstName, lastName } = req.body;

  console.log(`Received register request with email ${e}, password ${p}, firstName ${firstName}, lastName ${lastName}`);

  setTimeout(() => {
    res.json({ sessionToken: uuidv4() });
    next();
  }, 1000);
}
