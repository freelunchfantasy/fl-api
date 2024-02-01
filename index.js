// express and node libraries
import express from 'express';
const app = express();
import cors from 'cors';
import bodyParser from 'body-parser';

// config and middleware
import { getConfig } from './config.js';

// FreeLunch routes
import { leagueRoutes } from './routes/league/index.js';
import { authRoutes } from './routes/auth/index.js';

const appConfig = getConfig(process.env.NODE_ENV);

// 3rd party middleware
const corsOptions = {
  exposedHeaders: appConfig.corsHeaders,
  origin: [...appConfig.allowedOrigins],
};
app.use(cors(corsOptions));
var jsonParser = bodyParser.json();

// LEAGUE router
const leagueRouter = leagueRoutes(jsonParser);
app.use('/league', leagueRouter);

// AUTH router
const authRouter = authRoutes(jsonParser);
app.use('/auth', authRouter);

// Launch API on port 3000
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`FreeLunch API is listening on port ${port}`);
});
