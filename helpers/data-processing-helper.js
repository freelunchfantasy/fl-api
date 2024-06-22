export default class DataProcessingHelper {
  constructor() {}

  processUser(user) {
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    };
  }

  processUserLeagues(userLeagues) {
    return userLeagues.map(ul => ({
      id: ul.id,
      userId: ul.user_id,
      leagueId: ul.external_league_id,
      leagueName: ul.league_name,
      userTeamId: ul.user_team_id,
      userTeamName: ul.user_team_name,
      userTeamRank: ul.user_team_rank,
      totalTeams: ul.total_teams,
      leagueSource: ul.league_source_name,
    }));
  }

  processNflTeams(teams) {
    return teams.map(team => ({
      id: team.id,
      city: team.city,
      team: team.team,
      abbreviation: team.abbreviation,
      byeWeek: team.bye_week,
    }));
  }

  processLeagueSources(leagueSources) {
    return leagueSources
      .filter(source => source.name != 'Demo')
      .map(source => ({
        id: source.id,
        name: source.name,
      }));
  }
}
