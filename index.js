// express and node libraries
import express from 'express';
import http from 'http';
import cors from 'cors';
import logger from 'winston';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

// config and middleware
import { getConfig } from './config.js';
import auth from './auth/index.js';
import api from './api/index.js';
import checkToken from './middleware/check-token.js';
import updateLastActivity from './middleware/update-last-activity.js';

const appConfig = getConfig(process.env.NODE_ENV || 'production');

// Configure the logger
const configureLogger = app => {
  logger.configure({
    level: 'info',
    handleExceptions: true,
    json: true,
    colorize: true,
    transports: [new logger.transports.Console()],
  });
  app.use(morgan('dev'));
};

// 3rd party middleware
const configureThirdPartyMiddleware = app => {
  const rawCORSUrls = process.env.CORS_URLS || '[]';
  const corsUrls = JSON.parse(rawCORSUrls);
  const corsOptions = {
    exposedHeaders: appConfig.corsHeaders,
    origin: [...appConfig.allowedOrigins, ...corsUrls],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  const jwtPublicKey = process.env.JWT_PUBLIC_KEY;
  const checkTokenMiddleware = checkToken(logger, jwtPublicKey);
  app.use(checkTokenMiddleware);
};

const configurePostRequestMiddleware = app => {
  const updateLastActivityMiddleware = updateLastActivity(logger);
  app.use(updateLastActivityMiddleware);
};

const buildListenArguments = () => {
  const listenArguments = [];
  listenArguments.push(process.env.PORT || appConfig.port);

  const listenCallback = () => {
    logger.info(`FreeLunch API started on port ${app.server.address().port}`);
  };

  listenArguments.push(listenCallback);
  return listenArguments;
};

const startServer = app => {
  // Attach middleware to the API routes
  const preMiddlewareFn = routeable => {
    configureThirdPartyMiddleware(routeable);
    configureCustomMiddleware(routeable);
  };

  const apiRouter = api(preMiddlewareFn, configurePostRequestMiddleware);
  const apiBaseRoute = '/api';
  app.use(apiBaseRoute, apiRouter);

  // Initialize server
  const listenArguments = buildListenArguments();
  app.server.listen(...listenArguments);
};

const init = () => {
  let app = express();
  app.server = http.createServer(app);
  configureLogger(app);

  // Attach middleware to auth routes (no session cookie needed)
  const preMiddlewareFn = routeable => {
    configureThirdPartyMiddleware(routeable);
  };
  const authRouter = auth(preMiddlewareFn, configurePostRequestMiddleware);
  app.use('/auth', authRouter);

  app.get('/', (req, res) => {
    res.json({ message: 'PLEASE WORK plzzzzzzzzzzzzzzzzzz' });
  });

  startServer(app);
  return app;
};

const app = init();
export default app;
