const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

class PlayerService {
  constructor() {
    this.players = [];
    this.loadMockData();
  }

  // Load mock player data
  loadMockData() {
    this.players = [
      // Top QBs
      {
        id: '1',
        name: 'Patrick Mahomes',
        position: 'QB',
        team: 'KC',
        rank: 1,
        projectedPoints: 420.5,
        adp: 15.2,
        tier: 1,
        byeWeek: 10,
        isDrafted: false
      },
      {
        id: '2',
        name: 'Josh Allen',
        position: 'QB',
        team: 'BUF',
        rank: 2,
        projectedPoints: 410.3,
        adp: 18.7,
        tier: 1,
        byeWeek: 13,
        isDrafted: false
      },
      {
        id: '3',
        name: 'Jalen Hurts',
        position: 'QB',
        team: 'PHI',
        rank: 3,
        projectedPoints: 395.8,
        adp: 22.1,
        tier: 1,
        byeWeek: 10,
        isDrafted: false
      },
      // Top RBs
      {
        id: '4',
        name: 'Christian McCaffrey',
        position: 'RB',
        team: 'SF',
        rank: 4,
        projectedPoints: 380.2,
        adp: 2.3,
        tier: 1,
        byeWeek: 9,
        isDrafted: false
      },
      {
        id: '5',
        name: 'Austin Ekeler',
        position: 'RB',
        team: 'LAC',
        rank: 5,
        projectedPoints: 365.7,
        adp: 8.9,
        tier: 1,
        byeWeek: 5,
        isDrafted: false
      },
      {
        id: '6',
        name: 'Saquon Barkley',
        position: 'RB',
        team: 'NYG',
        rank: 6,
        projectedPoints: 350.4,
        adp: 12.4,
        tier: 1,
        byeWeek: 13,
        isDrafted: false
      },
      // Top WRs
      {
        id: '7',
        name: 'Justin Jefferson',
        position: 'WR',
        team: 'MIN',
        rank: 7,
        projectedPoints: 330.5,
        adp: 1.1,
        tier: 1,
        byeWeek: 13,
        isDrafted: false
      },
      {
        id: '8',
        name: 'Ja\'Marr Chase',
        position: 'WR',
        team: 'CIN',
        rank: 8,
        projectedPoints: 325.3,
        adp: 3.8,
        tier: 1,
        byeWeek: 7,
        isDrafted: false
      },
      {
        id: '9',
        name: 'Tyreek Hill',
        position: 'WR',
        team: 'MIA',
        rank: 9,
        projectedPoints: 320.7,
        adp: 5.2,
        tier: 1,
        byeWeek: 10,
        isDrafted: false
      },
      // Top TEs
      {
        id: '10',
        name: 'Travis Kelce',
        position: 'TE',
        team: 'KC',
        rank: 10,
        projectedPoints: 305.8,
        adp: 4.5,
        tier: 1,
        byeWeek: 10,
        isDrafted: false
      },
      {
        id: '11',
        name: 'Mark Andrews',
        position: 'TE',
        team: 'BAL',
        rank: 11,
        projectedPoints: 280.3,
        adp: 25.7,
        tier: 2,
        byeWeek: 13,
        isDrafted: false
      },
      // More players for variety
      {
        id: '12',
        name: 'Bijan Robinson',
        position: 'RB',
        team: 'ATL',
        rank: 12,
        projectedPoints: 270.5,
        adp: 6.8,
        tier: 2,
        byeWeek: 11,
        isDrafted: false
      },
      {
        id: '13',
        name: 'A.J. Brown',
        position: 'WR',
        team: 'PHI',
        rank: 13,
        projectedPoints: 260.7,
        adp: 13.2,
        tier: 2,
        byeWeek: 10,
        isDrafted: false
      },
      {
        id: '14',
        name: 'Joe Burrow',
        position: 'QB',
        team: 'CIN',
        rank: 14,
        projectedPoints: 250.2,
        adp: 45.3,
        tier: 2,
        byeWeek: 7,
        isDrafted: false
      },
      {
        id: '15',
        name: 'Tony Pollard',
        position: 'RB',
        team: 'DAL',
        rank: 15,
        projectedPoints: 235.3,
        adp: 28.4,
        tier: 2,
        byeWeek: 7,
        isDrafted: false
      }
    ];
  }

  // Get all available (undrafted) players
  async getAvailablePlayers() {
    return this.players.filter(player => !player.isDrafted);
  }

  // Get players by position
  async getPlayersByPosition(position) {
    return this.players.filter(player => 
      player.position === position.toUpperCase() && !player.isDrafted
    );
  }

  // Get player by ID
  async getPlayerById(id) {
    return this.players.find(player => player.id === id);
  }

  // Search players by name
  async searchPlayers(query) {
    const searchTerm = query.toLowerCase();
    return this.players.filter(player => 
      player.name.toLowerCase().includes(searchTerm) && !player.isDrafted
    );
  }

  // Mark player as drafted
  async markPlayerAsDrafted(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.isDrafted = true;
    }
    return player;
  }

  // Load players from CSV file
  async loadFromCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            id: data.Rank,
            name: data.Name,
            position: data.Position,
            team: data.Team,
            rank: parseInt(data.Rank),
            projectedPoints: parseFloat(data.ProjectedPoints),
            adp: parseFloat(data.ADP),
            tier: parseInt(data.Tier),
            byeWeek: parseInt(data.ByeWeek),
            isDrafted: false
          });
        })
        .on('end', () => {
          this.players = results;
          resolve(results);
        })
        .on('error', reject);
    });
  }

  // Load players from API
  async loadFromAPI(apiUrl, apiKey) {
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      this.players = response.data.map(player => ({
        ...player,
        isDrafted: false
      }));
      
      return this.players;
    } catch (error) {
      throw new Error(`Failed to load players from API: ${error.message}`);
    }
  }

  // Refresh player data
  async refreshPlayerData(source) {
    switch (source) {
      case 'mock':
        this.loadMockData();
        break;
      case 'csv':
        const csvPath = path.join(__dirname, '../data/player_rankings.csv');
        await this.loadFromCSV(csvPath);
        break;
      case 'api':
        const apiUrl = process.env.FANTASYPROS_API_URL;
        const apiKey = process.env.FANTASYPROS_API_KEY;
        await this.loadFromAPI(apiUrl, apiKey);
        break;
      default:
        throw new Error(`Unknown data source: ${source}`);
    }
  }

  // Get player statistics
  getPlayerStats() {
    const available = this.players.filter(p => !p.isDrafted);
    const byPosition = {};
    
    ['QB', 'RB', 'WR', 'TE', 'K', 'DST'].forEach(pos => {
      byPosition[pos] = available.filter(p => p.position === pos).length;
    });
    
    return {
      total: available.length,
      byPosition
    };
  }
}

module.exports = PlayerService;
