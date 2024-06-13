export default class DataProcessingHelper {
  constructor() {}

  processUser(user) {
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      leagues: user.leagues,
    };
  }

  processUserLeagues(userLeagues) {
    return userLeagues.map(ul => ({
      id: ul.id,
      userId: ul.user_id,
      leagueId: ul.external_league_id,
      leagueName: ul.league_name,
      userTeamId: ul.user_team_id,
    }));
  }
}
