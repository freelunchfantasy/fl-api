import constants from '../lib/constants.js';

export default class QueryHelper {
  constructor() {}

  getUserLeaguesQuery() {
    return `SELECT
                ul.id
              , ul.user_id
              , ul.external_league_id
              , ul.league_name
              , ul.user_team_id
              , ul.user_team_name
              , ul.user_team_rank
              , ul.total_teams
              , ls.name AS "league_source_name"
            FROM
              [user_league] ul
            JOIN
              [league_source] ls on ls.id = ul.league_source_id
            WHERE
              ul.user_id = @userId
            ORDER BY ul.id ASC`;
  }

  getCheckUserLeagueQuery() {
    return `SELECT
              id
            FROM
              [user_league]
            WHERE
              user_id = @userId
            AND
              external_league_id = @externalLeagueId
            AND
              league_source_id = @leagueSourceId`;
  }

  insertNewUserLeagueQuery() {
    return `INSERT INTO [user_league]
              (
                  user_id
                , external_league_id
                , league_name
                , user_team_id
                , user_team_name
                , user_team_rank
                , total_teams
                , league_source_id
              ) OUTPUT Inserted.id
              VALUES
              (
                  @userId
                , @externalLeagueId
                , @leagueName
                , @userTeamId
                , @userTeamName
                , @userTeamRank
                , @totalTeams
                , @leagueSourceId
              )`;
  }

  deleteUserLeagueQuery() {
    return `DELETE FROM [user_league]
            WHERE
              id = @userLeagueId`;
  }

  updateUserLeagueQuery() {
    return `UPDATE [user_league]
            SET
                league_name = @leagueName
              , user_team_id = @userTeamId
              , user_team_name = @userTeamName
              , user_team_rank = @userTeamRank
            WHERE
              id = @userLeagueId`;
  }

  getNflTeamsQuery() {
    return `SELECT
                id
              , city
              , team
              , abbreviation
              , bye_week
            FROM
              [nfl_team]`;
  }

  getLeagueSourcesQuery() {
    return `SELECT
                id
              , name
            FROM
              [league_source]`;
  }

  insertUserQuery() {
    return `INSERT INTO [user]
                (
                    first_name
                  , last_name
                  , email
                  , password
                  , date_joined
                  , last_activity
                ) OUTPUT Inserted.id
                VALUES
                (
                    @firstName
                  , @lastName
                  , @email
                  , @password
                  , @dateJoined
                  , @lastActivity
                )`;
  }

  getUserByEmailQuery() {
    return `SELECT
                id
            FROM
              [user] u
            WHERE
              u.email = @email`;
  }

  getUserByEmailAndPasswordQuery() {
    return `SELECT
                id
              , first_name
              , last_name
              , email
            FROM
              [user] u
            WHERE
              u.email = @email
            AND
              u.password = @password`;
  }

  getUserPasswordByEmailQuery() {
    return `SELECT
                password
            FROM
              [user] u
            WHERE
              u.email = @email`;
  }

  getUserByIdQuery() {
    return `SELECT
                id
              , first_name
              , last_name
              , email
            FROM
              [user] u
            WHERE
              u.id = @id;`;
  }

  updateUserLastActivityQuery() {
    return `UPDATE [user]
            SET
              last_activity = @lastActivity
            WHERE
              id = @id`;
  }

  getUserAndLeagueNamesQuery() {
    return `SELECT
                u.first_name
              , u.last_name
              , ul.league_name
            FROM
              [user] u
            JOIN
              [user_league] ul
              ON ul.user_id = u.id
            WHERE
              ul.id = @userLeagueId
            AND
              ul.user_id = @userId`;
  }

  assignDemoLeagueQuery() {
    return `INSERT INTO [user_league]
              (
                  user_id
                , external_league_id
                , league_name
                , user_team_id
                , league_source_id
                , user_team_name
                , user_team_rank
                , total_teams
              ) OUTPUT Inserted.id
              VALUES
              (
                  @userId
                , ${constants.DEMO_LEAGUE_EXTERNAL_ID}
                , '${constants.DEMO_LEAGUE_NAME}'
                , @userTeamId
                , ${constants.DEMO_LEAGUE_LEAGUE_SOURCE_ID}
                , @userTeamName
                , @userTeamRank
                , @totalTeams
              )`;
  }

  insertTradeSimulationQuery() {
    return `INSERT INTO [trade_simulation]
                (
                    user_id
                  , date_simulated
                ) OUTPUT Inserted.id
                VALUES
                (
                    @userId
                  , @dateSimulated
                )`;
  }

  insertTradeSimulationShareQuery() {
    return `INSERT INTO [trade_simulation_share]
                (
                    user_id
                  , user_league_id
                  , date_shared
                  , target_email
                ) OUTPUT Inserted.id
                VALUES
                (
                    @userId
                  , @userLeagueId
                  , @dateShared
                  , @targetEmail
                )`;
  }

  syncUserLeagueDataQuery() {
    return `UPDATE [user_league]
            SET
                user_team_name = @userTeamName
              , user_team_rank = @userTeamRank
              , total_teams = @totalTeams
            WHERE
              user_id = @userId
            AND
              external_league_id = @externalLeagueId
            AND
              league_source_id = @leagueSourceId`;
  }
}
