// express and node libraries
import express from 'express';
const app = express();
import cors from 'cors';
import bodyParser from 'body-parser';

// config and middleware
import { getConfig } from './config.js';

// dictionordle routes
import { authRoutes } from './routes/auth/index.js';
import { internalRoutes } from './routes/internal/index.js';
import { gameRoutes } from './routes/game/index.js';

const appConfig = getConfig(process.env.NODE_ENV);

// 3rd party middleware
const corsOptions = {
  exposedHeaders: appConfig.corsHeaders,
  origin: [...appConfig.allowedOrigins],
};
app.use(cors(corsOptions));
var jsonParser = bodyParser.json();

// Auth routes
const authRouter = authRoutes(jsonParser);
app.use('/auth', authRouter);

// Internal routes
const internalRouter = internalRoutes(jsonParser);
app.use('/internal', internalRouter);

// Game routes
const gameRouter = gameRoutes(jsonParser);
app.use('/game', gameRouter);

// Launch API on port 3000
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Dictionordle API is listening on port ${port}`);
});
