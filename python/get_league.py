
from espn_api.football import League
import sys
import json

try:
    leagueId = sys.argv[1]
    l = League(league_id=leagueId, year=2024)

    league = {}
    league['leagueId'] = l.league_id

    # settings
    settings = {}
    settings["regSeasonGames"] = l.settings.reg_season_count
    settings["name"] = l.settings.name
    settings["scoringType"] = l.settings.scoring_type
    settings["scoringFormat"] = l.settings.scoring_format
    
    # box score
    box_scores = l.box_scores()
    example_lineup = box_scores[0].home_lineup
    lineup = []
    for boxPlayer in example_lineup:
        lineup.append(boxPlayer.slot_position)
    settings['lineup'] = lineup

    # Finalize league settings
    league['settings'] = settings

    # teams
    teams = []
    for team in l.teams:
        t = {}
        t['id'] = team.team_id
        t['teamName'] = team.team_name
        t['wins'] = team.wins
        t['losses'] = team.losses
        t['ties'] = team.ties
        t['pointsFor'] = team.points_for
        t['pointsAgainst'] = team.points_against
        t['scores'] = team.scores
        t['outcomes'] = team.outcomes
        t['schedule'] = [opponent.team_id for opponent in team.schedule]
        
        # team's roster
        players = []
        for player in team.roster:
            p = {}
            p['id'] = player.playerId
            p['name'] = player.name
            p['rank'] = player.posRank
            p['proTeam'] = player.proTeam
            p['position'] = player.position
            p['projectedTotalPoints'] = player.projected_total_points
            p['projectedAveragePoints'] = player.projected_avg_points
            p['percentStarted'] = player.percent_started
            p['stats'] = player.stats

            # add player to team's roster
            players.append(p)
        t['roster'] = players

        # add team to league
        teams.append(t)
    league['teams'] = teams

    print(json.dumps(league))
    sys.stdout.flush()
except Exception as error:
    print('Something went wrong fetching data for league {league_id} - Error: {err}'.format(league_id=leagueId, err=error))
