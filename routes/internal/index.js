import Router from 'express';
import {
  getTargetWords,
  checkTargetWord,
  createTargetWord,
  deleteTargetWord,
  getTargetWordStats,
  resolveTargetWordStats,
} from './internal.routes.js';

export function internalRoutes(bodyParser) {
  const router = Router();

  // GET request for getting all target words
  router.get('/target-words', bodyParser, getTargetWords);

  // POST request for checking a potential new target word
  router.post('/check-target-word', bodyParser, checkTargetWord);

  // POST request for creating a new target word
  router.post('/create-target-word', bodyParser, createTargetWord);

  // DELETE request for deleting a target word
  router.delete('/target-word/:id', bodyParser, deleteTargetWord);

  // GET request for getting the stats of a target word
  router.get('/target-word-stats/:id', bodyParser, getTargetWordStats);

  // POST request for resolving stats of a target word
  router.post('/resolve-stats', bodyParser, resolveTargetWordStats);

  return router;
}
