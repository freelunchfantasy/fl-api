export default class QueryHelper {
  constructor() {}

  getUserLeaguesQuery() {
    return `SELECT
                id
              , user_id
              , external_league_id
              , league_name
              , user_team_id
            FROM
              [user_league]
            WHERE
              user_id = @userId`;
  }

  insertNewUserLeagueQuery() {
    return `INSERT INTO [user_league]
              (
                  user_id
                , external_league_id
                , league_name
                , user_team_id
              ) OUTPUT Inserted.id
              VALUES
              (
                  @userId
                , @externalLeagueId
                , @leagueName
                , @userTeamId
              )`;
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
}
