const PlayerService = require('./PlayerService');
const SettingsService = require('./SettingsService');

class DraftService {
  constructor() {
    this.playerService = new PlayerService();
    this.settingsService = new SettingsService();
    this.draftState = {
      currentRound: 1,
      currentPick: 1,
      totalPicks: 0,
      isComplete: false
    };
    this.draftPicks = [];
    this.teams = [];
    this.initializeDraft();
  }

  // Initialize draft with default settings
  initializeDraft() {
    const settings = this.settingsService.getLeagueSettings();
    this.draftState.totalPicks = settings.numberOfTeams * 15; // 15 rounds
    
    // Initialize teams
    this.teams = [];
    for (let i = 1; i <= settings.numberOfTeams; i++) {
      this.teams.push({
        id: i,
        name: `Team ${i}`,
        roster: [],
        picks: []
      });
    }
  }

  // Get current draft state
  async getDraftState() {
    return {
      ...this.draftState,
      teams: this.teams,
      availablePlayers: await this.playerService.getAvailablePlayers()
    };
  }

  // Make a draft pick
  async makePick(playerId, teamId, round, pickNumber) {
    const player = await this.playerService.getPlayerById(playerId);
    if (!player || player.isDrafted) {
      throw new Error('Player not available');
    }

    const team = this.teams.find(t => t.id === teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Mark player as drafted
    await this.playerService.markPlayerAsDrafted(playerId);

    // Add to team roster
    team.roster.push(player);
    team.picks.push({
      round,
      pickNumber,
      player,
      timestamp: new Date()
    });

    // Add to draft picks
    this.draftPicks.push({
      round,
      pickNumber,
      teamId,
      player,
      timestamp: new Date()
    });

    // Update draft state
    this.draftState.currentPick++;
    if (this.draftState.currentPick > this.draftState.totalPicks) {
      this.draftState.isComplete = true;
    } else {
      this.draftState.currentRound = Math.floor((this.draftState.currentPick - 1) / this.teams.length) + 1;
    }

    return {
      success: true,
      pick: this.draftPicks[this.draftPicks.length - 1],
      draftState: this.draftState
    };
  }

  // Get optimal pick suggestion
  async getOptimalPick(teamId, currentRound) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const availablePlayers = await this.playerService.getAvailablePlayers();
    const settings = this.settingsService.getLeagueSettings();

    // Calculate team needs
    const teamNeeds = this.calculateTeamNeeds(team, settings);
    
    // Get value-based rankings
    const valueRankings = this.getValueBasedRankings(availablePlayers, currentRound);
    
    // Calculate optimal pick
    const optimalPlayers = availablePlayers.map(player => {
      const score = this.calculatePlayerScore(player, teamNeeds, valueRankings, currentRound);
      return { ...player, score };
    }).sort((a, b) => b.score - a.score);

    return {
      optimalPick: optimalPlayers[0],
      alternatives: optimalPlayers.slice(1, 4),
      teamNeeds,
      reasoning: this.generateReasoning(optimalPlayers[0], teamNeeds, currentRound)
    };
  }

  // Calculate team needs based on roster requirements
  calculateTeamNeeds(team, settings) {
    const needs = {};
    const currentRoster = team.roster;
    
    // Count current players by position
    const currentCounts = {};
    ['QB', 'RB', 'WR', 'TE', 'K', 'DST'].forEach(pos => {
      currentCounts[pos] = currentRoster.filter(p => p.position === pos).length;
    });

    // Calculate needs based on roster requirements
    Object.entries(settings.rosterSpots).forEach(([position, required]) => {
      const current = currentCounts[position] || 0;
      needs[position] = Math.max(0, required - current);
    });

    // Add positional scarcity bonus
    const availableByPosition = {};
    ['QB', 'RB', 'WR', 'TE', 'K', 'DST'].forEach(pos => {
      availableByPosition[pos] = this.playerService.players.filter(p => 
        p.position === pos && !p.isDrafted
      ).length;
    });

    Object.keys(needs).forEach(position => {
      const available = availableByPosition[position] || 0;
      const scarcity = 1.0 / Math.max(1, available);
      needs[position] = needs[position] * (1.0 + scarcity);
    });

    return needs;
  }

  // Get value-based rankings
  getValueBasedRankings(availablePlayers, currentRound) {
    const rankings = {};
    
    availablePlayers.forEach(player => {
      let score = player.projectedPoints;
      
      // ADP adjustment (players going later than ADP are better value)
      const adpValue = Math.max(0, player.adp - currentRound);
      score += adpValue * 0.5;
      
      // Tier bonus
      score += player.tier * 10;
      
      // Position scarcity
      const positionScarcity = this.getPositionScarcity(player.position);
      score *= positionScarcity;
      
      rankings[player.id] = score;
    });
    
    return rankings;
  }

  // Calculate position scarcity
  getPositionScarcity(position) {
    const availableByPosition = {};
    ['QB', 'RB', 'WR', 'TE', 'K', 'DST'].forEach(pos => {
      availableByPosition[pos] = this.playerService.players.filter(p => 
        p.position === pos && !p.isDrafted
      ).length;
    });
    
    const totalAvailable = this.playerService.players.filter(p => !p.isDrafted).length;
    const positionAvailable = availableByPosition[position] || 0;
    
    if (totalAvailable === 0) return 1.0;
    
    const scarcity = totalAvailable / Math.max(1, positionAvailable);
    return Math.min(2.0, scarcity); // Cap at 2x
  }

  // Calculate player score
  calculatePlayerScore(player, teamNeeds, valueRankings, currentRound) {
    const needScore = teamNeeds[player.position] || 0;
    const valueScore = valueRankings[player.id] || 0;
    
    // Weight team needs more heavily in early rounds, value more in later rounds
    const needWeight = Math.max(0.3, 1.0 - currentRound * 0.05);
    const valueWeight = 1.0 - needWeight;
    
    return (needScore * needWeight) + (valueScore * valueWeight);
  }

  // Generate reasoning for pick suggestion
  generateReasoning(player, teamNeeds, currentRound) {
    const reasons = [];
    
    if (teamNeeds[player.position] > 0) {
      reasons.push(`Fills ${player.position} need (${teamNeeds[player.position].toFixed(1)} priority)`);
    }
    
    if (player.adp < currentRound) {
      reasons.push(`Great value (ADP: ${player.adp}, Current: ${currentRound})`);
    }
    
    if (player.tier <= 2) {
      reasons.push(`Tier ${player.tier} player - high upside`);
    }
    
    const scarcity = this.getPositionScarcity(player.position);
    if (scarcity > 1.5) {
      reasons.push(`${player.position} scarcity (${scarcity.toFixed(1)}x multiplier)`);
    }
    
    return reasons.join('; ');
  }

  // Get draft board
  async getDraftBoard() {
    const board = [];
    const settings = this.settingsService.getLeagueSettings();
    
    for (let round = 1; round <= 15; round++) {
      const roundPicks = [];
      for (let team = 1; team <= settings.numberOfTeams; team++) {
        const pickNumber = (round - 1) * settings.numberOfTeams + team;
        const pick = this.draftPicks.find(p => p.pickNumber === pickNumber);
        
        roundPicks.push({
          round,
          pickNumber,
          teamId: team,
          player: pick ? pick.player : null,
          timestamp: pick ? pick.timestamp : null
        });
      }
      board.push(roundPicks);
    }
    
    return board;
  }

  // Get team roster
  async getTeamRoster(teamId) {
    const team = this.teams.find(t => t.id === parseInt(teamId));
    if (!team) {
      throw new Error('Team not found');
    }
    
    return {
      team,
      roster: team.roster,
      picks: team.picks,
      stats: this.calculateTeamStats(team)
    };
  }

  // Calculate team statistics
  calculateTeamStats(team) {
    const roster = team.roster;
    const totalPoints = roster.reduce((sum, player) => sum + player.projectedPoints, 0);
    const avgTier = roster.length > 0 ? 
      roster.reduce((sum, player) => sum + player.tier, 0) / roster.length : 0;
    
    const byPosition = {};
    ['QB', 'RB', 'WR', 'TE', 'K', 'DST'].forEach(pos => {
      byPosition[pos] = roster.filter(p => p.position === pos).length;
    });
    
    return {
      totalPoints: Math.round(totalPoints),
      averageTier: Math.round(avgTier * 10) / 10,
      playerCount: roster.length,
      byPosition
    };
  }

  // Reset draft
  async resetDraft() {
    this.draftState = {
      currentRound: 1,
      currentPick: 1,
      totalPicks: 0,
      isComplete: false
    };
    this.draftPicks = [];
    this.teams = [];
    this.initializeDraft();
    
    // Reset all players to undrafted
    this.playerService.players.forEach(player => {
      player.isDrafted = false;
    });
  }

  // Get draft history
  async getDraftHistory() {
    return this.draftPicks.sort((a, b) => a.pickNumber - b.pickNumber);
  }
}

module.exports = DraftService;
