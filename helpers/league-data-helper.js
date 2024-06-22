export default class LeagueDataHelper {
  constructor() {}

  determineTeamRank(teams, targetTeamId) {
    const standings = this.constructStandings(teams);
    return standings.findIndex(team => team.id == targetTeamId) + 1;
  }

  constructStandings(teams) {
    let remTeams = teams;
    let standings = [];

    while (remTeams.length > 0) {
      const mostWins = Math.max(...remTeams.map(t => t.wins));
      const teamsWithMostWins = remTeams.filter(t => t.wins == mostWins);
      const topTeam = teamsWithMostWins.length > 1 ? this.tiebreakOnLosses(teamsWithMostWins) : teamsWithMostWins[0];
      standings.push(topTeam);
      remTeams = remTeams.filter(t => t.id != topTeam.id);
    }
    return standings;
  }

  tiebreakOnLosses(teams) {
    const leastLosses = Math.min(...teams.map(t => t.losses));
    const teamsWithLeastLosses = teams.filter(t => t.losses == leastLosses);
    return teamsWithLeastLosses.length > 1 ? this.tiebreakOnPointsFor(teamsWithLeastLosses) : teamsWithLeastLosses[0];
  }

  tiebreakOnPointsFor(teams) {
    const mostPointsFor = Math.max(...teams.map(t => parseFloat(t.pointsFor.toFixed(2))));
    const teamsWithMostPointsFor = teams.filter(t => parseFloat(t.pointsFor.toFixed(2)) == mostPointsFor);
    return teamsWithMostPointsFor.length > 1
      ? this.tiebreakOnPointsAgainst(teamsWithMostPointsFor)
      : teamsWithMostPointsFor[0];
  }

  tiebreakOnPointsAgainst(teams) {
    // If we have another level to tiebreak on, build this out
    return teams[0];
  }
}
