export default class QueryHelper {
  constructor() {}

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
}
