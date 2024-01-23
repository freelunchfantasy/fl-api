import Router from 'express';
import { getTodaysTargetWordId, getUserGuesses, guessWord, getGameEndInfo } from './game.routes.js';

export function gameRoutes(bodyParser) {
  const router = Router();

  // POST request for retrieving today's target word id
  router.post('/todays-target-word', bodyParser, getTodaysTargetWordId);

  // GET request for retrieving a user's guesses
  router.post('/user-guesses', bodyParser, getUserGuesses);

  // POST request for making a guess of the target word
  router.post('/guess-word', bodyParser, guessWord);

  // POST request for retrieving a user's game end info
  router.post('/game-end-info', bodyParser, getGameEndInfo);

  return router;
}
