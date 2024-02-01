// express and node libraries
import express from 'express';
import http from 'http';
import cors from 'cors';
import logger from 'winston';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

// config and middleware
import constants from './lib/constants.js';
import { getConfig } from './config.js';
import auth from './auth/index.js';
import api from './api/index.js';
import checkToken from './middleware/check-token.js';

const appConfig = getConfig(process.env.NODE_ENV);

// 3rd party middleware
const configureThirdPartyMiddleware = app => {
  const rawCORSUrls = process.env.CORS_URLS || '[]';
  const corsUrls = JSON.parse(rawCORSUrls);
  const corsOptions = {
    exposedHeaders: appConfig.corsHeaders,
    origin: [...appConfig.allowedOrigins, ...corsUrls],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Cookie'],
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(bodyParser.json());
  app.use(cookieParser());
  return app;
};

// Custom middleware
const configureCustomMiddleware = app => {
  // Use checkToken middleware
  const checkTokenMiddleware = checkToken(
    {
      cookieTokenAttribute: appConfig.cookieTokenAttribute,
      cookieDomain: appConfig.cookieDomain,
      cookieSecure: ['production'].includes(process.env.NODE_ENV),
    },
    logger
  );
  app.use(checkTokenMiddleware);
};

const buildListenArguments = () => {
  const listenArguments = [];
  listenArguments.push(process.env.PORT || appConfig.port);

  const listenCallback = () => {
    console.log(`FreeLunch API started on port ${app.server.address().port}`);
  };

  listenArguments.push(listenCallback);
  return listenArguments;
};

const startServer = app => {
  // Attach middleware to the API routes
  const preMiddlewareFn = routeable => {
    configureThirdPartyMiddleware(routeable), configureCustomMiddleware(routeable);
  };

  const apiRouter = api(preMiddlewareFn);
  const apiBaseRoute = '/api';
  app.use(apiBaseRoute, apiRouter);

  const listenArguments = buildListenArguments();

  app.server.listen(...listenArguments);
};

const init = () => {
  let app = express();
  app.server = http.createServer(app);

  // Attach middleware to auth routes (no session cookie needed)
  const preMiddlewareFn = routeable => {
    configureThirdPartyMiddleware(routeable);
  };
  const authRouter = auth(preMiddlewareFn);
  app.use('/auth', authRouter);

  startServer(app);
  return app;
};

const app = init();
export default app;
