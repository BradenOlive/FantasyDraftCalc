import React, { useState, useEffect } from 'react';
import { useDraft } from '../context/DraftContext';
import { FaLightbulb, FaSearch, FaFilter } from 'react-icons/fa';
import './PickSuggestions.css';

const PickSuggestions = () => {
  const { 
    draftState, 
    userTeam, 
    availablePlayers, 
    getOptimalPick, 
    loading, 
    error 
  } = useDraft();

  const [suggestion, setSuggestion] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userTeam && draftState.currentRound) {
      loadSuggestion();
    }
  }, [userTeam, draftState.currentRound]);

  const loadSuggestion = async () => {
    if (!userTeam) return;
    
    setLoadingSuggestion(true);
    try {
      const result = await getOptimalPick(userTeam.id, draftState.currentRound);
      setSuggestion(result);
    } catch (error) {
      console.error('Failed to load suggestion:', error);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const filteredPlayers = availablePlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = !selectedPosition || player.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  if (loading) {
    return <div className="loading">Loading suggestions...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="pick-suggestions">
      <div className="page-header">
        <h1 className="page-title">Pick Suggestions</h1>
        <p className="page-subtitle">
          AI-powered recommendations for your next pick
        </p>
      </div>

      <div className="suggestions-container">
        {/* Current Pick Info */}
        <div className="card current-pick-card">
          <h3>Current Pick</h3>
          <div className="pick-info">
            <div className="pick-details">
              <span className="pick-round">Round {draftState.currentRound}</span>
              <span className="pick-number">Pick {draftState.currentPick}</span>
            </div>
            <div className="team-status">
              {userTeam && (
                <div className="team-summary">
                  <span className="team-name">{userTeam.name}</span>
                  <span className="roster-count">{userTeam.roster.length} players</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Optimal Pick Suggestion */}
        <div className="card suggestion-card">
          <div className="suggestion-header">
            <FaLightbulb className="suggestion-icon" />
            <h3>Optimal Pick</h3>
          </div>
          
          {loadingSuggestion ? (
            <div className="loading-suggestion">Calculating optimal pick...</div>
          ) : suggestion?.optimalPick ? (
            <div className="optimal-pick">
              <div className="player-main-info">
                <div className="player-name">{suggestion.optimalPick.name}</div>
                <div className="player-details">
                  <span className={`position-badge ${suggestion.optimalPick.position.toLowerCase()}`}>
                    {suggestion.optimalPick.position}
                  </span>
                  <span className="player-team">{suggestion.optimalPick.team}</span>
                  <span className="player-tier">Tier {suggestion.optimalPick.tier}</span>
                </div>
              </div>
              
              <div className="player-stats">
                <div className="stat-item">
                  <span className="stat-label">Projected Points:</span>
                  <span className="stat-value">{Math.round(suggestion.optimalPick.projectedPoints)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">ADP:</span>
                  <span className="stat-value">{suggestion.optimalPick.adp}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Rank:</span>
                  <span className="stat-value">#{suggestion.optimalPick.rank}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Bye Week:</span>
                  <span className="stat-value">{suggestion.optimalPick.byeWeek}</span>
                </div>
              </div>
              
              <div className="reasoning">
                <h4>Why this pick:</h4>
                <p>{suggestion.reasoning}</p>
              </div>
            </div>
          ) : (
            <div className="no-suggestion">No optimal pick available</div>
          )}
        </div>

        {/* Team Needs */}
        {suggestion?.teamNeeds && (
          <div className="card needs-card">
            <h3>Team Needs</h3>
            <div className="needs-grid">
              {Object.entries(suggestion.teamNeeds).map(([position, need]) => (
                <div key={position} className="need-item">
                  <span className="position-label">{position}</span>
                  <div className="need-bar">
                    <div 
                      className="need-fill" 
                      style={{ width: `${Math.min(need * 20, 100)}%` }}
                    ></div>
                  </div>
                  <span className="need-value">{need.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alternative Picks */}
        {suggestion?.alternatives && suggestion.alternatives.length > 0 && (
          <div className="card alternatives-card">
            <h3>Alternative Picks</h3>
            <div className="alternatives-list">
              {suggestion.alternatives.map((player, index) => (
                <div key={player.id} className="alternative-player">
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className="player-details">
                      <span className={`position-badge ${player.position.toLowerCase()}`}>
                        {player.position}
                      </span>
                      <span className="player-team">{player.team}</span>
                    </div>
                  </div>
                  <div className="player-stats">
                    <span className="projected-points">{Math.round(player.projectedPoints)} pts</span>
                    <span className="adp">ADP: {player.adp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Available Players */}
      <div className="card available-players-card">
        <div className="players-header">
          <h3>Available Players</h3>
          
          <div className="search-filter">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="position-filter">
              <FaFilter className="filter-icon" />
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="filter-select"
              >
                <option value="">All Positions</option>
                <option value="QB">QB</option>
                <option value="RB">RB</option>
                <option value="WR">WR</option>
                <option value="TE">TE</option>
                <option value="K">K</option>
                <option value="DST">DST</option>
              </select>
            </div>
          </div>
        </div>

        <div className="players-list">
          {filteredPlayers.length === 0 ? (
            <div className="no-players">No players found</div>
          ) : (
            <div className="players-grid">
              {filteredPlayers.slice(0, 20).map((player) => (
                <div key={player.id} className="player-card">
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className="player-details">
                      <span className={`position-badge ${player.position.toLowerCase()}`}>
                        {player.position}
                      </span>
                      <span className="player-team">{player.team}</span>
                    </div>
                  </div>
                  <div className="player-stats">
                    <div className="projected-points">{Math.round(player.projectedPoints)} pts</div>
                    <div className="adp">ADP: {player.adp}</div>
                    <div className="rank">Rank: #{player.rank}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PickSuggestions;
