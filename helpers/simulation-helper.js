/**
 * Helper class for running simulations
 */
export default class SimulationHelper {
  constructor() {}

  async simulateLeague(teams, schedule) {
    return new Promise((resolve, reject) => {
      const numGames = schedule.length;
      let i = 0;
      let result = [];
      teams.forEach(team => {
        const wins = (Math.random() * (numGames * 100)) / 100;
        result.push({ id: team.id, wins, losses: numGames - wins });
      });
      setTimeout(() => {
        resolve(result);
      }, 1000);
    });
  }

  async simulateTrade(leagueVersion) {
    return new Promise(async (resolve, reject) => {
      let tradeResults = {
        before: await this.simulateLeague(leagueVersion[0].teams, leagueVersion[0].schedule),
        after: await this.simulateLeague(leagueVersion[1].teams, leagueVersion[1].schedule),
      };
      resolve(tradeResults);
    });
  }
}
