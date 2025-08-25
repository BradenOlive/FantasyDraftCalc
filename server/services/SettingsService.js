class SettingsService {
  constructor() {
    this.leagueSettings = {
      leagueType: 'PPR',
      numberOfTeams: 12,
      draftPosition: 1,
      snakeDraft: true,
      rosterSpots: {
        QB: 1,
        RB: 2,
        WR: 2,
        TE: 1,
        K: 1,
        DST: 1
      },
      scoringSettings: {
        passingYards: 0.04,
        passingTouchdowns: 4.0,
        interceptions: -2.0,
        rushingYards: 0.1,
        rushingTouchdowns: 6.0,
        receivingYards: 0.1,
        receivingTouchdowns: 6.0,
        receptions: 1.0, // PPR
        fumblesLost: -2.0,
        fieldGoals: 3.0,
        extraPoints: 1.0,
        sacks: 1.0,
        interceptionsDefense: 2.0,
        fumbleRecoveries: 2.0,
        defensiveTouchdowns: 6.0,
        safety: 2.0,
        pointsAllowed: {
          0: 10.0,
          6: 7.0,
          13: 4.0,
          20: 1.0,
          27: 0.0,
          34: -1.0,
          35: -4.0
        }
      }
    };

    this.leagueTypes = [
      { value: 'Standard', label: 'Standard' },
      { value: 'PPR', label: 'PPR' },
      { value: 'HalfPPR', label: 'Half PPR' },
      { value: 'Superflex', label: 'Superflex' },
      { value: 'Dynasty', label: 'Dynasty' }
    ];
  }

  // Get current league settings
  getLeagueSettings() {
    return this.leagueSettings;
  }

  // Update league settings
  updateLeagueSettings(newSettings) {
    this.leagueSettings = { ...this.leagueSettings, ...newSettings };
    return this.leagueSettings;
  }

  // Get available league types
  getLeagueTypes() {
    return this.leagueTypes;
  }

  // Get scoring settings
  getScoringSettings() {
    return this.leagueSettings.scoringSettings;
  }

  // Update scoring settings
  updateScoringSettings(newScoringSettings) {
    this.leagueSettings.scoringSettings = { 
      ...this.leagueSettings.scoringSettings, 
      ...newScoringSettings 
    };
    return this.leagueSettings.scoringSettings;
  }

  // Get roster requirements
  getRosterRequirements() {
    return this.leagueSettings.rosterSpots;
  }

  // Update roster requirements
  updateRosterRequirements(newRosterRequirements) {
    this.leagueSettings.rosterSpots = { 
      ...this.leagueSettings.rosterSpots, 
      ...newRosterRequirements 
    };
    return this.leagueSettings.rosterSpots;
  }

  // Apply league type presets
  applyLeagueTypePreset(leagueType) {
    switch (leagueType) {
      case 'Standard':
        this.leagueSettings.scoringSettings.receptions = 0.0;
        break;
      case 'PPR':
        this.leagueSettings.scoringSettings.receptions = 1.0;
        break;
      case 'HalfPPR':
        this.leagueSettings.scoringSettings.receptions = 0.5;
        break;
      case 'Superflex':
        this.leagueSettings.scoringSettings.receptions = 1.0;
        this.leagueSettings.rosterSpots.QB = 2; // Allow 2 QBs
        break;
      case 'Dynasty':
        this.leagueSettings.scoringSettings.receptions = 1.0;
        // Dynasty leagues might have different roster requirements
        this.leagueSettings.rosterSpots = {
          QB: 2,
          RB: 4,
          WR: 6,
          TE: 2,
          K: 1,
          DST: 1
        };
        break;
    }
    
    this.leagueSettings.leagueType = leagueType;
    return this.leagueSettings;
  }

  // Calculate player fantasy points based on scoring settings
  calculatePlayerPoints(playerStats) {
    const scoring = this.leagueSettings.scoringSettings;
    let points = 0;

    // Passing points
    points += (playerStats.passingYards || 0) * scoring.passingYards;
    points += (playerStats.passingTouchdowns || 0) * scoring.passingTouchdowns;
    points += (playerStats.interceptions || 0) * scoring.interceptions;

    // Rushing points
    points += (playerStats.rushingYards || 0) * scoring.rushingYards;
    points += (playerStats.rushingTouchdowns || 0) * scoring.rushingTouchdowns;

    // Receiving points
    points += (playerStats.receivingYards || 0) * scoring.receivingYards;
    points += (playerStats.receivingTouchdowns || 0) * scoring.receivingTouchdowns;
    points += (playerStats.receptions || 0) * scoring.receptions;

    // Kicking points
    points += (playerStats.fieldGoals || 0) * scoring.fieldGoals;
    points += (playerStats.extraPoints || 0) * scoring.extraPoints;

    // Defense points
    points += (playerStats.sacks || 0) * scoring.sacks;
    points += (playerStats.interceptionsDefense || 0) * scoring.interceptionsDefense;
    points += (playerStats.fumbleRecoveries || 0) * scoring.fumbleRecoveries;
    points += (playerStats.defensiveTouchdowns || 0) * scoring.defensiveTouchdowns;
    points += (playerStats.safety || 0) * scoring.safety;

    // Points allowed
    if (playerStats.pointsAllowed !== undefined) {
      const pa = playerStats.pointsAllowed;
      for (const [threshold, pointsValue] of Object.entries(scoring.pointsAllowed)) {
        if (pa <= parseInt(threshold)) {
          points += pointsValue;
          break;
        }
      }
    }

    // Fumbles
    points += (playerStats.fumblesLost || 0) * scoring.fumblesLost;

    return Math.round(points * 100) / 100; // Round to 2 decimal places
  }

  // Validate roster compliance
  validateRoster(roster) {
    const requirements = this.leagueSettings.rosterSpots;
    const counts = {};
    
    // Count players by position
    roster.forEach(player => {
      counts[player.position] = (counts[player.position] || 0) + 1;
    });

    const violations = [];
    
    // Check minimum requirements
    Object.entries(requirements).forEach(([position, required]) => {
      const actual = counts[position] || 0;
      if (actual < required) {
        violations.push(`Need ${required - actual} more ${position}(s)`);
      }
    });

    return {
      isValid: violations.length === 0,
      violations,
      counts
    };
  }

  // Get draft order for a specific round
  getDraftOrder(round) {
    const { numberOfTeams, draftPosition, snakeDraft } = this.leagueSettings;
    const order = [];
    
    if (snakeDraft && round % 2 === 0) {
      // Snake draft - even rounds go reverse
      for (let i = numberOfTeams; i >= 1; i--) {
        order.push(i);
      }
    } else {
      // Standard draft - odd rounds go forward
      for (let i = 1; i <= numberOfTeams; i++) {
        order.push(i);
      }
    }
    
    return order;
  }

  // Get when a specific team picks
  getTeamPickInfo(teamId, round) {
    const order = this.getDraftOrder(round);
    const pickPosition = order.indexOf(teamId) + 1;
    const pickNumber = (round - 1) * this.leagueSettings.numberOfTeams + pickPosition;
    
    return {
      round,
      pickPosition,
      pickNumber,
      isUserPick: teamId === this.leagueSettings.draftPosition
    };
  }
}

module.exports = SettingsService;
