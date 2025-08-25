# Fantasy Football Draft Calculator - Web App

A comprehensive web application built with React and Node.js that helps fantasy football players make optimal draft picks using advanced algorithms and real-time player rankings.

## 🏈 Features

### Core Functionality
- **Real-time Draft Board**: Visual representation of all picks and rounds
- **AI-Powered Pick Suggestions**: Advanced algorithm that considers team needs and player value
- **Dynamic Roster Tracking**: Real-time updates of team composition and positional needs
- **League Settings**: Support for PPR, Standard, Superflex, and Dynasty leagues
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Draft Optimization Algorithm
The app uses a sophisticated algorithm that combines:
- **Team Needs Analysis**: Calculates positional requirements based on roster spots
- **Value-Based Ranking**: Considers projected points, ADP, and tier rankings
- **Positional Scarcity**: Adjusts for position depth and availability
- **Round-Based Weighting**: Balances team needs vs. value based on draft round

### User Interface
- **Modern React Interface**: Clean, intuitive design with real-time updates
- **Tabbed Navigation**: Easy access to all features
- **Color-coded Positions**: Visual distinction for different player positions
- **Search & Filter**: Find players by name, position, or other criteria
- **Interactive Draft Board**: Click to make picks and see real-time updates

### Data Integration
- **Multiple Data Sources**: Support for mock data, CSV files, and API integration
- **Expert Rankings**: Integration with FantasyPros API (requires API key)
- **Custom Scoring**: Configurable scoring settings for different league types

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fantasy-draft-calculator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
fantasy-draft-calculator/
├── server/                     # Backend Node.js/Express server
│   ├── index.js               # Main server file
│   ├── routes/                # API route handlers
│   │   ├── players.js         # Player data endpoints
│   │   ├── draft.js           # Draft management endpoints
│   │   └── settings.js        # League settings endpoints
│   ├── services/              # Business logic
│   │   ├── PlayerService.js   # Player data management
│   │   ├── DraftService.js    # Draft optimization algorithm
│   │   └── SettingsService.js # League configuration
│   └── data/                  # Static data files
│       └── player_rankings.csv
├── client/                    # React frontend
│   ├── public/                # Static assets
│   ├── src/                   # React source code
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context providers
│   │   └── styles/            # CSS styles
│   └── package.json
└── package.json               # Root package.json
```

## 🧠 Algorithm Details

### Team Needs Calculation
```javascript
calculateTeamNeeds(team, settings) {
  const needs = {};
  
  // Count current players by position
  const currentCounts = {};
  ['QB', 'RB', 'WR', 'TE', 'K', 'DST'].forEach(pos => {
    currentCounts[pos] = team.roster.filter(p => p.position === pos).length;
  });

  // Calculate needs based on roster requirements
  Object.entries(settings.rosterSpots).forEach(([position, required]) => {
    const current = currentCounts[position] || 0;
    needs[position] = Math.max(0, required - current);
  });

  // Add positional scarcity bonus
  Object.keys(needs).forEach(position => {
    const available = availableByPosition[position] || 0;
    const scarcity = 1.0 / Math.max(1, available);
    needs[position] = needs[position] * (1.0 + scarcity);
  });

  return needs;
}
```

### Value-Based Ranking
```javascript
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
```

### Player Score Calculation
```javascript
calculatePlayerScore(player, teamNeeds, valueRankings, currentRound) {
  const needScore = teamNeeds[player.position] || 0;
  const valueScore = valueRankings[player.id] || 0;
  
  // Weight team needs more heavily in early rounds, value more in later rounds
  const needWeight = Math.max(0.3, 1.0 - currentRound * 0.05);
  const valueWeight = 1.0 - needWeight;
  
  return (needScore * needWeight) + (valueScore * valueWeight);
}
```

## 🎨 UI Components

### Draft Board
- Visual grid showing all rounds and picks
- Color-coded player positions
- Real-time updates when picks are made
- Click to make picks functionality

### Pick Suggestions
- AI-powered optimal pick recommendations
- Alternative suggestions with reasoning
- Team needs visualization
- Value analysis

### Roster Management
- Current team composition
- Position distribution charts
- Draft history tracking
- Team statistics

### Settings Panel
- League type configuration
- Scoring settings customization
- Roster requirements setup
- Data source selection

## 📊 Data Sources

### Mock Data (Default)
The app includes comprehensive mock data with top fantasy football players for immediate testing.

### CSV Import
Support for importing player rankings from CSV files with the following format:
```csv
Name,Position,Team,Rank,ProjectedPoints,ADP,Tier,ByeWeek
Patrick Mahomes,QB,KC,1,420.5,15.2,1,10
```

### API Integration
Connect to external APIs for real-time player data:
- **FantasyPros API**: Professional player rankings and projections
- **Custom APIs**: Support for other fantasy football data providers

## 🔧 Configuration

### League Types
- **Standard**: Traditional scoring without PPR
- **PPR**: Point per reception scoring
- **Half PPR**: 0.5 points per reception
- **Superflex**: Allows 2 QBs in starting lineup
- **Dynasty**: Long-term league with expanded rosters

### Scoring Settings
Fully customizable scoring for:
- Passing: Yards, TDs, Interceptions
- Rushing: Yards, TDs
- Receiving: Yards, TDs, Receptions
- Kicking: Field Goals, Extra Points
- Defense: Sacks, Interceptions, TDs, etc.

### Roster Requirements
Configurable roster spots for each position:
- QB: 1-2 spots
- RB: 2-4 spots
- WR: 2-6 spots
- TE: 1-2 spots
- K: 1 spot
- DST: 1 spot

## 🚀 Deployment

### Development
```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
```

### Production
```bash
npm run build        # Build React app
npm start           # Start production server
```

### Environment Variables
Create a `.env` file in the server directory:
```env
PORT=5000
FANTASYPROS_API_URL=https://api.fantasypros.com/v1/json/nfl/players
FANTASYPROS_API_KEY=your_api_key_here
```

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## 📈 Performance

### Optimization Features
- **Lazy Loading**: Components load on demand
- **Memoization**: React.memo for expensive calculations
- **Debounced Search**: Optimized player search
- **Virtual Scrolling**: Efficient handling of large player lists

### Scalability
- **Modular Architecture**: Easy to extend and maintain
- **API-First Design**: Backend can serve multiple clients
- **State Management**: Efficient React context usage
- **Caching**: Player data caching for better performance

## 🔮 Future Enhancements

### Planned Features
- **Mock Draft Mode**: Practice drafts with AI opponents
- **Trade Analysis**: Evaluate potential trades during draft
- **Draft Strategy**: Pre-draft planning and strategy tools
- **Historical Data**: Track draft performance over time
- **Export Options**: Share draft results and analysis
- **Real-time Collaboration**: Multi-user draft support

### Technical Improvements
- **Offline Support**: Service worker for offline functionality
- **Advanced Analytics**: More sophisticated optimization algorithms
- **Performance Optimization**: Better handling of large player pools
- **Mobile App**: React Native version for mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check the code comments and API documentation
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

### Common Issues
- **CORS Errors**: Ensure the backend is running on the correct port
- **API Errors**: Check your API keys and network connectivity
- **Build Errors**: Clear node_modules and reinstall dependencies

## 🙏 Acknowledgments

- **FantasyPros**: For player rankings and projections
- **React Community**: For the excellent React ecosystem
- **Node.js Community**: For the robust backend framework
- **Fantasy Football Community**: For feedback and suggestions

---

**Note**: This app is for educational and entertainment purposes. Always verify player rankings and projections from multiple sources before making actual draft decisions.
