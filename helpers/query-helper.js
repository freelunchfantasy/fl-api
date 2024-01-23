export default class QueryHelper {
  constructor() {}

  /**
   * Generate the query string for INSERTing a game user into the database
   * @returns - the query string
   */
  insertGameUserQuery() {
    return `INSERT INTO game_user
              ( auth_user_id
                , email
                , date_joined
                , last_login
                , current_streak
                , longest_streak
              )
              OUTPUT Inserted.id
              VALUES
              (
                @authUserId
                , @email
                , @dateJoined
                , @lastLogin
                , @currentStreak
                , @longestStreak
              )`;
  }

  /**
   * Generate the query string for SELECTing a game user by their auth user id
   * @returns - the query string
   */
  selectGameUserQuery() {
    return `SELECT
              id
            FROM
              game_user
            WHERE
              auth_user_id = @authUserId`;
  }

  /**
   * Generate the query string for SELECTing all target words from the database
   * @returns - the query string
   */
  selectTargetWordsQuery() {
    return `SELECT
                    id
                    , word
                    , num_letters
                    , num_syllables
                    , first_used
                    , word_definition
                    , target_date
                    , num_guesses
                    , num_users
                    , stats_resolved
                FROM
                    target_word`;
  }

  /**
   * Generate the query string for INSERTing a target word into the database
   * @returns - the query string
   */
  insertTargetWordQuery() {
    return `INSERT INTO target_word
                (
                    word
                  , num_letters
                  , num_syllables
                  , first_used
                  , word_definition
                  , target_date 
                )
            VALUES
                (
                    @word
                  , @numLetters
                  , @numSyllables
                  , @firstUsed
                  , @definition
                  , @targetDate
                )`;
  }

  /**
   * Generate the query string for DELETing a target word from the database
   * @returns - the query string
   */
  deleteTargetWordQuery() {
    return `DELETE FROM target_word
            WHERE
                id = @id`;
  }

  /**
   * Generate the query string for SELECTing stats of a target word from the database
   * @returns - the query string
   */
  selectTargetWordStatsQuery() {
    return `SELECT
                tw.id
                , word
                , target_date
                , COUNT(ug.id) AS "num_guesses"
                , COUNT(distinct ug.game_user_id) AS "num_users"
              FROM
                target_word tw
              LEFT JOIN
                user_guess ug on ug.target_word_id = tw.id
              WHERE
                tw.id = @id
              GROUP BY
                tw.id, word, target_date`;
  }

  /**
   * Generate the query string for UPDATEing stats of a target word in the database
   */
  updateTargetWordStatsQuery() {
    return `UPDATE
              target_word
            SET
              num_users = @numUsers
              , num_guesses = @numGuesses
              , stats_resolved = 1
            WHERE
              id = @id`;
  }

  /**
   * Generate the query string for DELETEing user guesses of a target word id from the database
   * @returns - the query string
   */
  deleteUserGuessesQuery() {
    return `DELETE FROM
              user_guess
            OUTPUT
              Deleted.guess_id
            WHERE
              target_word_id = @targetWordId`;
  }

  /**
   * Generate the query string for DELETEing guesses by id from the database
   * @returns - the query string
   */
  deleteGuessesQuery() {
    return `DELETE FROM
              guess
            WHERE
              id = @guessId`;
  }

  /**
   * Generate the query string for SELECTing a target word by its id from the database
   * @returns - the query string
   */
  selectTargetWordByIdQuery() {
    return `SELECT
              id
              , word
              , num_letters
              , num_syllables
              , first_used
              , word_definition
              , target_date
              , num_guesses
              , num_users
            FROM
              target_word
            WHERE
              id = @id`;
  }

  /**
   * Generate the query string for SELECTing todays target word id
   * @returns - the query string
   */
  selectTodaysTargetWordIdQuery() {
    return `SELECT
              id
            FROM
              target_word
            WHERE
              target_date = @date`;
  }

  /**
   * Generate the query string for SELECTing user guesses for given user id and target word id
   * @returns - the query string
   */
  selectUserGuessesQuery() {
    return `SELECT 
              g.id,
              g.word,
              g.result
            FROM
              guess g
            JOIN 
              user_guess ug ON ug.guess_id = g.id
            JOIN
              target_word tw on ug.target_word_id = tw.id
            WHERE
              ug.game_user_id = @userId
            AND
              tw.target_date = @date
            ORDER BY
              g.time_guessed ASC`;
  }

  /**
   * Generate the query string for INSERTing a guess into the database
   * @returns - the query string
   */
  insertGuessQuery() {
    return `INSERT INTO guess
              (word, result)
            OUTPUT
              Inserted.id
            VALUES
              (@word, @result)`;
  }

  /**
   * Generate the query string for INSERTing a user guess into the database
   * @returns - the query string
   */
  InsertUserGuessQuery() {
    return `INSERT INTO user_guess
              (game_user_id, guess_id, target_word_id)
            VALUES
              (@userId, @guessId, @targetWordId)`;
  }

  /**
   * Generate the query string for UPDATEing a user's current streak to increment by 1
   * @returns - the query string
   */
  increaseUserCurrentStreakQuery() {
    return `UPDATE 
              game_user
            SET
              current_streak = current_streak + 1
            WHERE
              id = @userId`;
  }

  /**
   * Generate the query string for UPDATEing a user's longest streak
   * @returns - the query string
   */
  updateUserLongestStreakQuery() {
    return `UPDATE
              game_user
            SET
              longest_streak = 
                (SELECT (
                  SELECT
                    MAX(streak)
                  FROM
                    (VALUES (gu.current_streak), (gu.longest_streak)) AS AllStreaks(streak)
                ) FROM game_user gu
                  WHERE id = @userId)
            WHERE
              id = @userId`;
  }

  /**
   * Generate the query string for UPDATEing a user's current streak to reset to 0
   * @returns - the query string
   */
  resetUserCurrentStreakQuery() {
    return `UPDATE
              game_user
            SET
              current_streak = 0
            WHERE
              id = @userId`;
  }

  /**
   * Generate the query string for SELECTing game end info from the database
   * @returns - the query string
   */
  selectGameEndInfoQuery() {
    return `SELECT
              tw.word
              , tw.word_definition
              , gu.current_streak
              , gu.longest_streak
            FROM
              user_guess ug
            JOIN
              game_user gu ON gu.id = ug.game_user_id
            JOIN
              target_word tw ON tw.id = ug.target_word_id
            WHERE
              gu.id = @gameUserId
            AND
              tw.id = @targetWordId
            GROUP BY
              tw.word
              , tw.word_definition
              , gu.current_streak
              , gu.longest_streak`;
  }
}
