// express and node libraries
import express from 'express';
const app = express();
import cors from 'cors';
import bodyParser from 'body-parser';

// config and middleware
import { getConfig } from './config.js';

// dictionordle routes
import { leagueRoutes } from './routes/league/index.js';

const appConfig = getConfig(process.env.NODE_ENV);

// 3rd party middleware
const corsOptions = {
  exposedHeaders: appConfig.corsHeaders,
  origin: [...appConfig.allowedOrigins],
};
app.use(cors(corsOptions));
var jsonParser = bodyParser.json();

// App routes
const leagueRouter = leagueRoutes(jsonParser);
app.use('/league', leagueRouter);

// Launch API on port 3000
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Dictionordle API is listening on port ${port}`);
});
